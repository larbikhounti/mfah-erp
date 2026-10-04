import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DriverJwtPayloadType } from '../../auth/types/jwt-payload.type';
import { DriverSession } from '../types/driver-session.type';

/**
 * Runs after the global AuthGuard has verified the JWT and confirmed it is a
 * driver token. Re-checks the driver against the database on every request,
 * so a revoked PIN, a PIN reset, or a deleted driver cuts access immediately
 * instead of waiting for the token to expire.
 */
@Injectable()
export class DriverSessionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const payload = request.user as DriverJwtPayloadType | undefined;

    if (!payload?.sub) {
      throw new UnauthorizedException();
    }

    const credential = await this.prisma.driverCredential.findUnique({
      where: { driverId: payload.sub },
      include: { driver: true },
    });

    if (
      !credential ||
      credential.tokenVersion !== payload.tokenVersion ||
      credential.driver.deletedAt
    ) {
      throw new UnauthorizedException('Session is no longer valid');
    }

    const session: DriverSession = {
      id: credential.driver.id,
      fullName: credential.driver.fullName,
      phone: credential.driver.phone,
    };
    request.driver = session;
    return true;
  }
}
