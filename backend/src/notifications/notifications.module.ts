import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DriverAuthModule } from '../driver-auth/driver-auth.module';
import { DriverPushController } from './controllers/driver-push.controller';
import { WebPushService } from './services/web-push.service';
import { PushSubscriptionsService } from './services/push-subscriptions.service';
import { MissionNotificationsListener } from './listeners/mission-notifications.listener';
import { DriverAccessRevokedListener } from './listeners/driver-access-revoked.listener';

/**
 * Web Push notifications to drivers' phones. Purely reactive: it listens to
 * domain events (mission assigned/updated/cancelled…) — no other module
 * calls into it, so adding a new kind of notification never touches them.
 */
@Module({
  imports: [ConfigModule, DriverAuthModule],
  controllers: [DriverPushController],
  providers: [
    WebPushService,
    PushSubscriptionsService,
    MissionNotificationsListener,
    DriverAccessRevokedListener,
  ],
  exports: [WebPushService],
})
export class NotificationsModule {}
