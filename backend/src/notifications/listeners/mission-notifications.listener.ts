import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PrismaService } from '../../prisma/prisma.service';
import {
  MissionDriverEvent,
  MissionEvents,
} from '../../missions/events/mission.events';
import { MissionMessages } from '../messages/mission-messages';
import { PushMessage } from '../types/push-message.type';
import { WebPushService } from '../services/web-push.service';

type MessageBuilder = (typeof MissionMessages)[keyof typeof MissionMessages];

/** Turns mission domain events into push notifications for the driver. */
@Injectable()
export class MissionNotificationsListener {
  private readonly logger = new Logger(MissionNotificationsListener.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly webPush: WebPushService,
  ) {}

  @OnEvent(MissionEvents.DRIVER_ASSIGNED, { async: true })
  onAssigned(event: MissionDriverEvent) {
    return this.notify(event, MissionMessages.assigned);
  }

  @OnEvent(MissionEvents.DETAILS_CHANGED, { async: true })
  onDetailsChanged(event: MissionDriverEvent) {
    return this.notify(event, MissionMessages.detailsChanged);
  }

  @OnEvent(MissionEvents.CANCELLED, { async: true })
  onCancelled(event: MissionDriverEvent) {
    return this.notify(event, MissionMessages.cancelled);
  }

  @OnEvent(MissionEvents.DRIVER_UNASSIGNED, { async: true })
  onUnassigned(event: MissionDriverEvent) {
    return this.notify(event, MissionMessages.unassigned);
  }

  private async notify(
    event: MissionDriverEvent,
    build: MessageBuilder,
  ): Promise<void> {
    try {
      const mission = await this.prisma.mission.findUnique({
        where: { id: event.missionId },
      });
      if (!mission) {
        return;
      }
      const message: PushMessage = build(mission);
      await this.webPush.sendToDriver(event.driverId, message);
    } catch (error) {
      this.logger.error(
        `Could not notify driver ${event.driverId} about mission ${event.missionId}`,
        error,
      );
    }
  }
}
