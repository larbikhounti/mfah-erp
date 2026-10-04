import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { IS_DRIVER_ROUTE_KEY } from '../decorator/driver-route.decorator';
import { Reflector } from '@nestjs/core';
import { DRIVER_TOKEN_KIND } from '../types/jwt-payload.type';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If route is public, allow access without authentication
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    let payload: any;
    try {
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      payload = await this.verifyAccessToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid access token');
      }
    } catch (error) {
      this.logger.error('Error occurred while verifying access token', error);
      throw new UnauthorizedException();
    }

    this.assertTokenKindMatchesRoute(context, payload);
    request['user'] = payload;
    return true;
  }

  // Staff and driver tokens are signed with the same secret, so without
  // this check a driver token would pass on staff routes (and its `sub`, a
  // Driver.id, would be looked up as a Users.id by PermissionGuard).
  private assertTokenKindMatchesRoute(
    context: ExecutionContext,
    payload: { kind?: string },
  ): void {
    const isDriverRoute = this.reflector.getAllAndOverride<boolean>(
      IS_DRIVER_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    const isDriverToken = payload.kind === DRIVER_TOKEN_KIND;

    if (isDriverRoute && !isDriverToken) {
      throw new ForbiddenException('This route is for drivers only');
    }
    if (!isDriverRoute && isDriverToken) {
      throw new ForbiddenException('Drivers cannot access this route');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    //this.logger.debug(`Extracted token from header: ${token}`);
    return type === 'Bearer' ? token : undefined;
  }

  private verifyAccessToken(token: string): Promise<any> {
    try {
      return this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }
}
