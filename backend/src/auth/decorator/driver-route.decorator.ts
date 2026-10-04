import { SetMetadata } from '@nestjs/common';

export const IS_DRIVER_ROUTE_KEY = 'isDriverRoute';

/**
 * Marks a controller/handler as part of the driver portal: the global
 * AuthGuard then only accepts driver tokens there (and rejects them
 * everywhere else). Prefer `@DriverEndpoint()` from the driver-auth module,
 * which also applies the session guard.
 */
export const DriverRoute = () => SetMetadata(IS_DRIVER_ROUTE_KEY, true);
