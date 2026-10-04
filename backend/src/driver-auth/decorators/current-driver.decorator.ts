import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { DriverSession } from '../types/driver-session.type';

/** The authenticated driver on a `@DriverEndpoint()` route. */
export const CurrentDriver = createParamDecorator(
  (_data: unknown, context: ExecutionContext): DriverSession =>
    context.switchToHttp().getRequest().driver,
);
