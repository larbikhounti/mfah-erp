import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { DriverCredential } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { comparePassword } from '../../helpers/helper.helpers';
import { DRIVER_TOKEN_KIND } from '../../auth/types/jwt-payload.type';
import { normalizePhone } from '../helpers/phone.helper';
import {
  DEFAULT_DRIVER_TOKEN_TTL,
  MAX_FAILED_PIN_ATTEMPTS,
  PIN_LOCKOUT_MINUTES,
} from '../driver-auth.constants';
import { DriverLoginDto } from '../dtos/driver-login.dto';
import {
  DriverLoginResponse,
  DriverProfileResponse,
} from '../types/driver-session.type';

const INVALID_CREDENTIALS = 'Invalid phone number or PIN';

@Injectable()
export class DriverAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(dto: DriverLoginDto): Promise<DriverLoginResponse> {
    const credential = await this.prisma.driverCredential.findUnique({
      where: { loginPhone: normalizePhone(dto.phone) },
      include: { driver: true },
    });

    if (!credential || credential.driver.deletedAt) {
      throw new UnauthorizedException(INVALID_CREDENTIALS);
    }

    this.assertNotLocked(credential);

    if (!(await comparePassword(dto.pin, credential.pinHash))) {
      await this.registerFailedAttempt(credential);
    }

    await this.prisma.driverCredential.update({
      where: { id: credential.id },
      data: {
        failedPinAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date(),
      },
    });

    const access_token = await this.jwtService.signAsync(
      {
        sub: credential.driverId,
        kind: DRIVER_TOKEN_KIND,
        tokenVersion: credential.tokenVersion,
      },
      {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn:
          this.configService.get<string>('DRIVER_JWT_EXPIRATION_TIME') ||
          DEFAULT_DRIVER_TOKEN_TTL,
      },
    );

    const { driver } = credential;
    return {
      access_token,
      driver: { id: driver.id, fullName: driver.fullName, phone: driver.phone },
    };
  }

  async getProfile(driverId: number): Promise<DriverProfileResponse> {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver) {
      throw new NotFoundException('Driver not found');
    }
    return {
      id: driver.id,
      fullName: driver.fullName,
      phone: driver.phone,
      cin: driver.cin,
    };
  }

  private assertNotLocked(credential: DriverCredential): void {
    if (credential.lockedUntil && credential.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (credential.lockedUntil.getTime() - Date.now()) / 60_000,
      );
      throw new HttpException(
        `Too many wrong PINs. Try again in ${minutesLeft} min.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async registerFailedAttempt(
    credential: DriverCredential,
  ): Promise<never> {
    const attempts = credential.failedPinAttempts + 1;
    const locked = attempts >= MAX_FAILED_PIN_ATTEMPTS;

    await this.prisma.driverCredential.update({
      where: { id: credential.id },
      data: locked
        ? {
            failedPinAttempts: 0,
            lockedUntil: new Date(Date.now() + PIN_LOCKOUT_MINUTES * 60_000),
          }
        : { failedPinAttempts: attempts },
    });

    if (locked) {
      throw new HttpException(
        `Too many wrong PINs. Try again in ${PIN_LOCKOUT_MINUTES} min.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    throw new UnauthorizedException(INVALID_CREDENTIALS);
  }
}
