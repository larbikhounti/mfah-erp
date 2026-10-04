import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as webPush from 'web-push';
import { PrismaService } from '../../prisma/prisma.service';
import { PushMessage } from '../types/push-message.type';

/** Push services answer these when a subscription is gone for good. */
const EXPIRED_SUBSCRIPTION_STATUSES = new Set([404, 410]);

/**
 * Sends Web Push notifications to a driver's devices via the `web-push`
 * library (VAPID). Without VAPID keys configured the app still runs; pushes
 * are simply skipped with a warning at boot.
 */
@Injectable()
export class WebPushService implements OnModuleInit {
  private readonly logger = new Logger(WebPushService.name);
  private enabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    const publicKey = this.configService.get<string>('VAPID_PUBLIC_KEY');
    const privateKey = this.configService.get<string>('VAPID_PRIVATE_KEY');
    const subject = this.configService.get<string>('VAPID_SUBJECT');

    if (!publicKey || !privateKey || !subject) {
      this.logger.warn(
        'VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY / VAPID_SUBJECT not set — push notifications are disabled',
      );
      return;
    }

    webPush.setVapidDetails(subject, publicKey, privateKey);
    this.enabled = true;
  }

  getPublicKey(): string | null {
    return this.enabled
      ? (this.configService.get<string>('VAPID_PUBLIC_KEY') ?? null)
      : null;
  }

  /** Fire-and-forget friendly: never throws, logs failures instead. */
  async sendToDriver(driverId: number, message: PushMessage): Promise<void> {
    if (!this.enabled) {
      return;
    }

    const subscriptions = await this.prisma.pushSubscription.findMany({
      where: { driverId },
    });
    const payload = JSON.stringify(message);

    await Promise.all(
      subscriptions.map(async (subscription) => {
        try {
          await webPush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: { p256dh: subscription.p256dh, auth: subscription.auth },
            },
            payload,
          );
        } catch (error) {
          if (
            error instanceof webPush.WebPushError &&
            EXPIRED_SUBSCRIPTION_STATUSES.has(error.statusCode)
          ) {
            await this.prisma.pushSubscription.deleteMany({
              where: { id: subscription.id },
            });
            return;
          }
          this.logger.error(
            `Push to driver ${driverId} (subscription ${subscription.id}) failed`,
            error,
          );
        }
      }),
    );
  }
}
