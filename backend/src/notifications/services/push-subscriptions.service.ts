import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { PushSubscriptionDto } from '../dtos/push-subscription.dto';

@Injectable()
export class PushSubscriptionsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Re-subscribing the same browser just moves it to the current driver
   *  (e.g. a shared phone), it never duplicates. */
  async subscribe(
    driverId: number,
    dto: PushSubscriptionDto,
    userAgent?: string,
  ): Promise<{ subscribed: true }> {
    const data = {
      driverId,
      p256dh: dto.keys.p256dh,
      auth: dto.keys.auth,
      userAgent: userAgent?.slice(0, 300),
    };
    await this.prisma.pushSubscription.upsert({
      where: { endpoint: dto.endpoint },
      create: { endpoint: dto.endpoint, ...data },
      update: data,
    });
    return { subscribed: true };
  }

  async unsubscribe(
    driverId: number,
    endpoint: string,
  ): Promise<{ subscribed: false }> {
    await this.prisma.pushSubscription.deleteMany({
      where: { driverId, endpoint },
    });
    return { subscribed: false };
  }

  async removeAllForDriver(driverId: number): Promise<void> {
    await this.prisma.pushSubscription.deleteMany({ where: { driverId } });
  }
}
