import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { hashPassword } from '../../helpers/helper.helpers';
import {
  DriverEvents,
  DriverPortalAccessRevokedEvent,
} from '../../drivers/events/driver.events';
import { isPlausiblePhone, normalizePhone } from '../helpers/phone.helper';
import { PortalAccessResponse } from '../types/driver-session.type';

/** Staff-side management of a driver's portal login (PIN set/reset/revoke). */
@Injectable()
export class DriverCredentialsService {
  private readonly logger = new Logger(DriverCredentialsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async getAccess(driverId: number): Promise<PortalAccessResponse> {
    await this.findDriverOrThrow(driverId);
    const credential = await this.prisma.driverCredential.findUnique({
      where: { driverId },
    });
    return this.toResponse(credential);
  }

  /** Grants access, or resets the PIN — which also signs out every device. */
  async setPin(driverId: number, pin: string): Promise<PortalAccessResponse> {
    const driver = await this.findDriverOrThrow(driverId);
    const loginPhone = this.loginPhoneFor(driver.phone);
    const pinHash = await hashPassword(pin);

    try {
      const credential = await this.prisma.driverCredential.upsert({
        where: { driverId },
        create: { driverId, loginPhone, pinHash },
        update: {
          loginPhone,
          pinHash,
          failedPinAttempts: 0,
          lockedUntil: null,
          tokenVersion: { increment: 1 },
        },
      });
      return this.toResponse(credential);
    } catch (error) {
      throw this.mapPhoneConflict(error);
    }
  }

  async revoke(driverId: number): Promise<PortalAccessResponse> {
    await this.findDriverOrThrow(driverId);
    await this.prisma.driverCredential.deleteMany({ where: { driverId } });
    this.events.emit(
      DriverEvents.PORTAL_ACCESS_REVOKED,
      new DriverPortalAccessRevokedEvent(driverId),
    );
    return this.toResponse(null);
  }

  /** Keeps the login phone in step when staff edit the driver's phone. */
  async syncLoginPhone(driverId: number, phone: string): Promise<void> {
    const normalized = normalizePhone(phone);
    if (!isPlausiblePhone(normalized)) {
      this.logger.warn(
        `Driver ${driverId} phone "${phone}" is not a valid login phone; login phone left unchanged`,
      );
      return;
    }
    try {
      await this.prisma.driverCredential.updateMany({
        where: { driverId },
        data: { loginPhone: normalized },
      });
    } catch (error) {
      this.logger.warn(
        `Could not update login phone for driver ${driverId}: ${this.mapPhoneConflict(error).message}`,
      );
    }
  }

  private async findDriverOrThrow(driverId: number) {
    const driver = await this.prisma.driver.findUnique({
      where: { id: driverId },
    });
    if (!driver || driver.deletedAt) {
      throw new NotFoundException('Driver not found');
    }
    return driver;
  }

  private loginPhoneFor(phone: string): string {
    const normalized = normalizePhone(phone);
    if (!isPlausiblePhone(normalized)) {
      throw new BadRequestException(
        "The driver's phone number is not valid — fix it before giving portal access",
      );
    }
    return normalized;
  }

  private mapPhoneConflict(error: unknown): Error {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      return new ConflictException(
        'Another driver with portal access already uses this phone number',
      );
    }
    return error as Error;
  }

  private toResponse(
    credential: {
      loginPhone: string;
      lockedUntil: Date | null;
      lastLoginAt: Date | null;
    } | null,
  ): PortalAccessResponse {
    return {
      enabled: !!credential,
      loginPhone: credential?.loginPhone ?? null,
      lockedUntil: credential?.lockedUntil ?? null,
      lastLoginAt: credential?.lastLoginAt ?? null,
    };
  }
}
