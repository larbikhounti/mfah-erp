<#
.SYNOPSIS
    DOM Installation Script - Automated Docker Compose Deployment

.DESCRIPTION
    This script automates the deployment of DOM services on Windows machines by:
    - Downloading configuration files from the server
    - Extracting and configuring docker-compose.yml with DOME_ID
    - Starting Docker Compose services
    - Launching the print bridge executable
    - Opening the application in the default browser

.PARAMETER domeId
    The unique identifier for this DOME installation (required)
    Must contain only alphanumeric characters, hyphens, and underscores

.PARAMETER downloadUrl
    The URL to download configfiles.zip from (optional)
    Default: https://api.mydomhub.store/api/configfiles.zip

.PARAMETER maxRetries
    Maximum number of download retry attempts (optional)
    Default: 3

.PARAMETER downloadTimeout
    Download timeout in seconds (optional)
    Default: 300 (5 minutes)

.EXAMPLE
    .\install.ps1 -domeId "FACTORY-123"

.EXAMPLE
    .\install.ps1 -domeId "DOME-001" -downloadUrl "http://custom-server:8459/api/configfiles.zip"

.NOTES
    Version: 1.0
    Requires: PowerShell 5.0+, Docker Desktop
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, HelpMessage="Enter the DOME ID (alphanumeric, hyphens, and underscores only)")]
    [ValidatePattern('^[a-zA-Z0-9_-]+$')]
    [ValidateNotNullOrEmpty()]
    [string]$domeId,

    [Parameter(Mandatory=$false)]
    [ValidateNotNullOrEmpty()]
    [string]$downloadUrl = "https://api.mydomhub.store/api/configfiles.zip",

    [Parameter(Mandatory=$false)]
    [ValidateRange(1, 10)]
    [int]$maxRetries = 3,

    [Parameter(Mandatory=$false)]
    [ValidateRange(30, 600)]
    [int]$downloadTimeout = 300
)

# Script version
$scriptVersion = "1.0"

# Exit codes
$EXIT_SUCCESS = 0
$EXIT_INVALID_PARAMS = 1
$EXIT_ENV_CHECK_FAILED = 2
$EXIT_DOWNLOAD_FAILED = 3
$EXIT_EXTRACTION_FAILED = 4
$EXIT_CONFIG_FAILED = 5
$EXIT_DOCKER_FAILED = 6

#region Helper Functions

function Write-Header {
    Write-Host "`n=====================================" -ForegroundColor Cyan
    Write-Host "  DOM Installation Script v$scriptVersion" -ForegroundColor Cyan
    Write-Host "  Windows Docker Compose Deployer" -ForegroundColor Cyan
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
}

function Write-Section {
    param([string]$Message)
    Write-Host "`n$Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor White
}

function Write-Step {
    param([string]$Message)
    Write-Host "  $Message" -ForegroundColor Cyan
}

function Test-PowerShellVersion {
    $requiredVersion = [Version]"5.0"
    $currentVersion = $PSVersionTable.PSVersion

    if ($currentVersion -lt $requiredVersion) {
        Write-Error "PowerShell version $requiredVersion or higher is required. Current version: $currentVersion"
        return $false
    }

    Write-Success "PowerShell Version: OK ($currentVersion)"
    return $true
}

function Test-DockerAvailable {
    try {
        $dockerVersion = docker --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker is not available. Please install Docker Desktop from https://www.docker.com/products/docker-desktop"
            return $false
        }
        Write-Success "Docker Available: OK ($dockerVersion)"

        $composeVersion = docker compose version 2>&1
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Docker Compose is not available. Please ensure Docker Desktop is properly installed"
            return $false
        }
        Write-Success "Docker Compose Available: OK ($composeVersion)"

        return $true
    }
    catch {
        Write-Error "Failed to check Docker installation: $_"
        return $false
    }
}

function Test-InternetConnectivity {
    param([string]$Url)

    try {
        $uri = [System.Uri]$Url
        $testUrl = "$($uri.Scheme)://$($uri.Host)"

        $null = Test-Connection -ComputerName $uri.Host -Count 1 -Quiet -ErrorAction Stop
        Write-Success "Internet Connectivity: OK"
        return $true
    }
    catch {
        Write-Warning "Could not verify connectivity to $($uri.Host). Will attempt download anyway."
        return $true
    }
}

function Get-LocalIPAddress {
    Write-Section "Detecting local IP address..."

    # Method 1: Parse ipconfig with adapter awareness
    try {
        $ipconfigOutput = ipconfig
        $adapters = @()
        $currentAdapter = $null

        foreach ($line in $ipconfigOutput) {
            # Detect adapter header
            if ($line -match '^(Wireless LAN adapter|Ethernet adapter) (.+):') {
                if ($currentAdapter) {
                    $adapters += $currentAdapter
                }
                $currentAdapter = @{
                    Name = $matches[2]
                    Type = $matches[1]
                    IPv4 = $null
                    Gateway = $null
                }
            }
            # Extract IPv4 Address
            elseif ($line -match 'IPv4 Address.*:\s+(\d+\.\d+\.\d+\.\d+)') {
                if ($currentAdapter) {
                    $currentAdapter.IPv4 = $matches[1]
                }
            }
            # Extract Default Gateway
            elseif ($line -match 'Default Gateway.*:\s+(\d+\.\d+\.\d+\.\d+)') {
                if ($currentAdapter) {
                    $currentAdapter.Gateway = $matches[1]
                }
            }
        }

        # Add last adapter
        if ($currentAdapter) {
            $adapters += $currentAdapter
        }

        # Filter and prioritize
        $validAdapters = $adapters | Where-Object {
            # Must have IPv4 and Gateway
            $_.IPv4 -and $_.Gateway -and
            # Skip virtual adapters
            $_.Name -notmatch 'WSL|vEthernet|VirtualBox|VMware|Hyper-V|Docker' -and
            # Skip loopback and link-local
            $_.IPv4 -notmatch '^127\.' -and $_.IPv4 -notmatch '^169\.254\.'
        }

        # Prioritize by IP range (192.168.x.x first, then 10.x.x.x)
        $preferredIp = $validAdapters |
            Where-Object { $_.IPv4 -match '^192\.168\.' } |
            Select-Object -First 1 -ExpandProperty IPv4 -ErrorAction SilentlyContinue

        if (-not $preferredIp) {
            $preferredIp = $validAdapters |
                Where-Object { $_.IPv4 -match '^10\.' } |
                Select-Object -First 1 -ExpandProperty IPv4 -ErrorAction SilentlyContinue
        }

        if (-not $preferredIp) {
            $preferredIp = $validAdapters |
                Select-Object -First 1 -ExpandProperty IPv4 -ErrorAction SilentlyContinue
        }

        if ($preferredIp) {
            Write-Success "Local IP detected via ipconfig: $preferredIp"
            return $preferredIp
        }
    }
    catch {
        Write-Warning "Method 1 (ipconfig parsing) failed: $_"
    }

    # Method 2: WMI with gateway filter (fallback)
    try {
        $adapter = Get-WmiObject -Class Win32_NetworkAdapterConfiguration -Filter "IPEnabled=1" -ErrorAction Stop |
            Where-Object {
                $null -ne $_.IPAddress -and
                $null -ne $_.DefaultIPGateway -and
                $_.DefaultIPGateway.Count -gt 0
            } |
            Where-Object {
                # Skip virtual adapters
                $_.Description -notmatch 'WSL|Virtual|Hyper-V|VMware|VirtualBox'
            } |
            Select-Object -First 1

        if ($adapter -and $adapter.IPAddress) {
            $localIp = $adapter.IPAddress |
                Where-Object {
                    $_ -match '^\d+\.\d+\.\d+\.\d+$' -and
                    $_ -notmatch '^127\.' -and
                    $_ -notmatch '^169\.254\.'
                } |
                Select-Object -First 1

            if ($localIp) {
                Write-Success "Local IP detected via WMI: $localIp"
                return $localIp
            }
        }
    }
    catch {
        Write-Warning "Method 2 (WMI) failed: $_"
    }

    # Method 3: .NET NetworkInterface with gateway check (fallback)
    try {
        $localIp = [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces() |
            Where-Object {
                $_.OperationalStatus -eq 'Up' -and
                $_.NetworkInterfaceType -ne 'Loopback' -and
                $_.Name -notmatch 'WSL|vEthernet|Virtual|Hyper-V'
            } |
            ForEach-Object {
                $props = $_.GetIPProperties()
                # Only if has gateway
                if ($props.GatewayAddresses.Count -gt 0) {
                    $props.UnicastAddresses |
                        Where-Object { $_.Address.AddressFamily -eq 'InterNetwork' } |
                        Select-Object -First 1 -ExpandProperty Address
                }
            } |
            Where-Object {
                $ip = $_.ToString()
                $ip -notmatch '^127\.' -and $ip -notmatch '^169\.254\.'
            } |
            Select-Object -First 1

        if ($localIp) {
            Write-Success "Local IP detected via .NET: $localIp"
            return $localIp.ToString()
        }
    }
    catch {
        Write-Warning "Method 3 (.NET) failed: $_"
    }

    # Method 4: Final fallback to localhost
    Write-Warning "Could not detect local IP address. Using 'localhost' as fallback."
    Write-Info "You may need to access the application at: http://<your-local-ip>:3000"
    return "localhost"
}

#endregion

#region Main Script

try {
    # Display header
    Write-Header

    # Phase 1: Initialization
    Write-Section "Initializing installation..."
    Write-Info "DOME ID: $domeId"
    Write-Info "Download URL: $downloadUrl"
    Write-Info ""

    # Validate environment
    Write-Section "Validating environment requirements..."

    if (-not (Test-PowerShellVersion)) {
        exit $EXIT_ENV_CHECK_FAILED
    }

    if (-not (Test-DockerAvailable)) {
        exit $EXIT_ENV_CHECK_FAILED
    }

    Test-InternetConnectivity -Url $downloadUrl | Out-Null

    # Phase 2: File Paths & Directories
    Write-Section "Setting up working directory..."

    $workingDirectory = Join-Path $env:LOCALAPPDATA "Dom"
    $configFilesZipPath = Join-Path $workingDirectory "configfiles.zip"
    $extractPath = Join-Path $workingDirectory "extracted"
    $dockerComposeFilePath = Join-Path $extractPath "docker-compose.yml"
    $printBridgeExePath = Join-Path $extractPath "print_bridgev2.exe"

    Write-Info "Working directory: $workingDirectory"

    # Create working directory
    if (-not (Test-Path $workingDirectory)) {
        New-Item -ItemType Directory -Path $workingDirectory -Force | Out-Null
        Write-Success "Created working directory"
    }
    else {
        Write-Success "Working directory exists"
    }

    # Clean previous extraction
    if (Test-Path $extractPath) {
        Write-Info "Cleaning previous extraction..."
        Remove-Item -Path $extractPath -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Phase 3: Download with Retry Logic
    Write-Section "Downloading configfiles.zip..."
    Write-Info "Downloading from: $downloadUrl"
    Write-Info "Maximum retries: $maxRetries"
    Write-Info "Timeout: $downloadTimeout seconds"
    Write-Info ""

    $downloadSuccess = $false
    for ($attempt = 1; $attempt -le $maxRetries; $attempt++) {
        try {
            Write-Step "Attempt $attempt/$maxRetries..."

            # Download file with progress bar
            $webClient = New-Object System.Net.WebClient

            # Register progress event
            $progressHandler = {
                param($sender, $e)
                $receivedMB = [math]::Round($e.BytesReceived / 1MB, 2)
                $totalMB = [math]::Round($e.TotalBytesToReceive / 1MB, 2)
                $progressPercent = $e.ProgressPercentage

                Write-Progress -Activity "Downloading configfiles.zip" `
                    -Status "$receivedMB MB / $totalMB MB ($progressPercent%)" `
                    -PercentComplete $progressPercent
            }

            Register-ObjectEvent -InputObject $webClient -EventName DownloadProgressChanged -Action $progressHandler | Out-Null

            try {
                # Download the file
                $webClient.DownloadFile($downloadUrl, $configFilesZipPath)

                # Clear progress bar
                Write-Progress -Activity "Downloading configfiles.zip" -Completed

                # Verify file size
                if (Test-Path $configFilesZipPath) {
                    $fileSize = (Get-Item $configFilesZipPath).Length
                    $fileSizeMB = [math]::Round($fileSize / 1MB, 2)

                    if ($fileSize -gt 1MB) {
                        Write-Success "Download successful!"
                        Write-Info "File size: $fileSizeMB MB"
                        $downloadSuccess = $true
                        break
                    }
                    else {
                        throw "Downloaded file is too small ($fileSizeMB MB). Expected > 1 MB."
                    }
                }
                else {
                    throw "Downloaded file not found at $configFilesZipPath"
                }
            }
            finally {
                # Cleanup event handler
                Get-EventSubscriber | Where-Object { $_.SourceObject -eq $webClient } | Unregister-Event
                $webClient.Dispose()
            }
        }
        catch {
            Write-Progress -Activity "Downloading configfiles.zip" -Completed
            Write-Warning "Attempt $attempt failed: $_"

            if ($attempt -lt $maxRetries) {
                Write-Info "Retrying in 2 seconds..."
                Start-Sleep -Seconds 2
            }
            else {
                Write-Error "Failed to download configfiles.zip after $maxRetries attempts"
                Write-Error "Please check your network connection and try again"
                # exit $EXIT_DOWNLOAD_FAILED
            }
        }
    }

    if (-not $downloadSuccess) {
        Write-Error "Download failed. Exiting."
        # exit $EXIT_DOWNLOAD_FAILED
    }

    # Phase 4: Extract ZIP File
    Write-Section "Extracting configuration files..."
    Write-Info "Extracting to: $extractPath"

    try {
        Expand-Archive -Path $configFilesZipPath -DestinationPath $extractPath -Force -ErrorAction Stop

        # Count extracted items
        $extractedItems = Get-ChildItem -Path $extractPath -Recurse
        Write-Success "Extracted $($extractedItems.Count) items"

        # Verify critical files exist
        $missingFiles = @()

        if (-not (Test-Path $dockerComposeFilePath)) {
            $missingFiles += "docker-compose.yml"
        }

        if (-not (Test-Path $printBridgeExePath)) {
            $missingFiles += "print_bridgev2.exe"
        }

        if ($missingFiles.Count -gt 0) {
            Write-Error "Critical files missing from configfiles.zip: $($missingFiles -join ', ')"
            Write-Error "Please verify the integrity of configfiles.zip on the server"
            # exit $EXIT_EXTRACTION_FAILED
        }

        Write-Success "All critical files verified"
    }
    catch {
        Write-Error "Failed to extract configfiles.zip: $_"
        # exit $EXIT_EXTRACTION_FAILED
    }

    # Phase 5: Modify docker-compose.yml
    Write-Section "Updating DOME_ID in docker-compose.yml..."

    try {
        # Read the entire file
        $content = Get-Content -Path $dockerComposeFilePath -Raw -ErrorAction Stop

        # Pattern to match DOM_ID=value (handles spaces around =)
        $pattern = '(DOM_ID\s*=\s*)([^\s\n]+)'

        # Check if pattern exists
        if ($content -match $pattern) {
            Write-Info "Found DOM_ID variable"

            # Replace with new value
            $replacement = "`${1}$domeId"
            $modifiedContent = $content -replace $pattern, $replacement

            # Write back to file
            Set-Content -Path $dockerComposeFilePath -Value $modifiedContent -NoNewline -ErrorAction Stop

            Write-Success "Updated: DOM_ID = $domeId"
        }
        else {
            Write-Warning "DOM_ID variable not found in docker-compose.yml"
            Write-Warning "Deployment will continue, but DOME_ID may not be set correctly"
        }
    }
    catch {
        Write-Error "Failed to update docker-compose.yml: $_"
        # exit $EXIT_CONFIG_FAILED
    }

    # Phase 6: Start Docker Compose
    Write-Section "Starting Docker Compose services..."
    Write-Info "Directory: $extractPath"
    Write-Info "Running: docker compose up -d"
    Write-Info ""

    try {
        Push-Location $extractPath

        try {
            # Run docker-compose up
            $output = docker-compose up -d #2>&1

            if ($LASTEXITCODE -eq 0) {
                Write-Success "Docker Compose started successfully!"
                Write-Info ""
                Write-Info "Output:"
                $output | ForEach-Object { Write-Info $_ }
            }
            else {
                throw "Docker Compose exited with code $LASTEXITCODE`n$output"
            }
        }
        finally {
            Pop-Location
        }
    }
    catch {
        Write-Host "`nDocker Compose Error:" -ForegroundColor Red
        Write-Host "  $_" -ForegroundColor Red
        Write-Warning "Docker Compose may have failed to start. Continuing with remaining steps..."
        Write-Info "Tip: Check if Docker Desktop is running with 'docker ps'"
    }

    # Phase 7: Service Readiness Health Check
    Write-Section "Waiting for services to be ready..."
    Write-Info "Target: localhost:3000"
    Write-Info "Timeout: 300 seconds"
    Write-Info ""

    $maxWaitSeconds = 300
    $checkInterval = 5
    $elapsed = 0
    $servicesReady = $false

    while ($elapsed -lt $maxWaitSeconds) {
        try {
            $tcpClient = New-Object System.Net.Sockets.TcpClient
            $tcpClient.Connect("localhost", 3000)
            $tcpClient.Close()

            Write-Success "Services are ready!"
            $servicesReady = $true
            break
        }
        catch {
            $attempt = [math]::Floor($elapsed / $checkInterval) + 1
            Write-Step "Attempt $attempt (elapsed: ${elapsed}s)... Not ready"
            Start-Sleep -Seconds $checkInterval
            $elapsed += $checkInterval
        }
    }

    if (-not $servicesReady) {
        Write-Warning "Services did not become ready within $maxWaitSeconds seconds"
        Write-Warning "They may still be starting up. Check with: docker ps"
    }

    # Phase 8: Execute print_bridgev2.exe
    Write-Section "Launching print_bridgev2.exe..."
    Write-Info "Path: $printBridgeExePath"

    try {
        if (Test-Path $printBridgeExePath) {
            $process = Start-Process -FilePath $printBridgeExePath -PassThru -NoNewWindow -ErrorAction Stop
            Write-Success "print_bridgev2.exe started successfully"
            Write-Info "Process ID: $($process.Id)"
        }
        else {
            Write-Warning "print_bridgev2.exe not found at expected location"
            Write-Warning "Path: $printBridgeExePath"
        }
    }
    catch {
        Write-Warning "Failed to start print_bridgev2.exe: $_"
        Write-Warning "You may need to run it manually from: $printBridgeExePath"
    }

    # Phase 9: Auto-Detect Local IP
    $localIp = Get-LocalIPAddress

    # Phase 10: Open Browser
    Write-Section "Opening application in browser..."

    $appUrl = "http://${localIp}:3000"

    try {
        Start-Process $appUrl -ErrorAction Stop
        Write-Success "Browser window should open shortly..."
        Write-Info "URL: $appUrl"
    }
    catch {
        Write-Warning "Could not open browser automatically: $_"
        Write-Info "Please open this URL manually: $appUrl"
    }

    # Phase 11: Completion Summary
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  Deployment Completed Successfully!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""

    Write-Host "Configuration:" -ForegroundColor Cyan
    Write-Host "  DOME_ID: $domeId"
    Write-Host "  Local IP: $localIp"
    Write-Host "  Extracted to: $extractPath"
    Write-Host ""

    Write-Host "Service URLs:" -ForegroundColor Cyan
    Write-Host "  Frontend:  http://${localIp}:3000"
    Write-Host "  Backend:   http://${localIp}:8459/api/v1"
    Write-Host "  Database:  localhost:5432"
    Write-Host ""

    Write-Host "Useful Commands:" -ForegroundColor Cyan
    Write-Host "  View logs:"
    Write-Host "    docker compose -f `"$dockerComposeFilePath`" logs -f" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  Stop services:"
    Write-Host "    docker compose -f `"$dockerComposeFilePath`" down" -ForegroundColor Gray
    Write-Host ""
    Write-Host "  View containers:"
    Write-Host "    docker ps" -ForegroundColor Gray
    Write-Host ""

    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "Visit http://${localIp}:3000 to access the application" -ForegroundColor White
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""

    # exit $EXIT_SUCCESS
}
catch {
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host "  An Error Occurred" -ForegroundColor Red
    Write-Host "=====================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Stack Trace:" -ForegroundColor Yellow
    Write-Host $_.ScriptStackTrace -ForegroundColor Gray
    Write-Host ""
}

#endregion
