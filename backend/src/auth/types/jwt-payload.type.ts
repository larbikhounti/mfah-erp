export type JwtPayloadType = {
  sub: number;
  email: string;
  iat: number;
  exp: number;
};

/**
 * Driver-portal tokens share the signing secret with staff tokens, so they
 * carry an explicit `kind` marker. The global AuthGuard uses it to keep the
 * two worlds apart: a driver token is rejected on every staff route, and a
 * staff token on every driver route (see `@DriverRoute()`).
 */
export const DRIVER_TOKEN_KIND = 'driver';

export type DriverJwtPayloadType = {
  /** Driver.id — never a Users.id. */
  sub: number;
  kind: typeof DRIVER_TOKEN_KIND;
  /** Must match DriverCredential.tokenVersion, or the token was revoked. */
  tokenVersion: number;
  iat: number;
  exp: number;
};
