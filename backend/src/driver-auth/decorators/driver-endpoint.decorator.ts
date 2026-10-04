import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { DriverRoute } from '../../auth/decorator/driver-route.decorator';
import { DriverSessionGuard } from '../guards/driver-session.guard';

/**
 * Put this on any driver-portal controller (or handler): only valid driver
 * tokens get through, and `@CurrentDriver()` becomes available.
 */
export const DriverEndpoint = () =>
  applyDecorators(
    DriverRoute(),
    UseGuards(DriverSessionGuard),
    ApiBearerAuth('access-token'),
  );
