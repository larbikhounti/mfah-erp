import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DriverEvents,
  DriverPortalAccessRevokedEvent,
} from '../../drivers/events/driver.events';
import { PushSubscriptionsService } from '../services/push-subscriptions.service';

/** A driver without portal access must stop receiving pushes too. */
@Injectable()
export class DriverAccessRevokedListener {
  constructor(private readonly subscriptions: PushSubscriptionsService) {}

  @OnEvent(DriverEvents.PORTAL_ACCESS_REVOKED, { async: true })
  handle(event: DriverPortalAccessRevokedEvent): Promise<void> {
    return this.subscriptions.removeAllForDriver(event.driverId);
  }
}
