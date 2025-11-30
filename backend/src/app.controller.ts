import { Controller, Get, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
import { Public } from './decorator/public.decorator';
import { CdnService } from './cdn/cdn.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly cdnService: CdnService,
  ) {}

  @Public()
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('configfiles.zip')
  @ApiOperation({ summary: 'Download configfiles.zip' })
  @ApiResponse({
    status: 200,
    description: 'Configuration files zip download',
    content: {
      'application/zip': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Configuration files not found',
  })
  async getConfigFiles(@Res() res: Response): Promise<void> {
    return this.cdnService.serveConfigFiles(res);
  }

  @Public()
  @Get('install.ps1')
  @ApiOperation({ summary: 'Download install.ps1 PowerShell script' })
  @ApiResponse({
    status: 200,
    description: 'PowerShell installation script download',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Installation script not found',
  })
  async getInstallScript(@Res() res: Response): Promise<void> {
    return this.cdnService.serveInstallScript(res);
  }
}
