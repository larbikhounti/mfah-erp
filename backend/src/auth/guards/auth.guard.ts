import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorator/public.decorator';
import { Reflector } from '@nestjs/core';

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

    try {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      const payload = await this.verifyAccessToken(token);
      if (!payload) {
        throw new UnauthorizedException('Invalid access token');
      }

      request['user'] = payload;
    } catch (error) {
      this.logger.error('Error occurred while verifying access token', error);
      throw new UnauthorizedException();
    }
    return true;
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
