/** What DriverSessionGuard attaches to `request.driver` on driver routes. */
export interface DriverSession {
  id: number;
  fullName: string;
  phone: string;
}

export interface DriverLoginResponse {
  access_token: string;
  driver: DriverSession;
}

export interface DriverProfileResponse extends DriverSession {
  cin: string;
}

export interface PortalAccessResponse {
  enabled: boolean;
  loginPhone: string | null;
  lockedUntil: Date | null;
  lastLoginAt: Date | null;
}
