import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DriverEvents,
  DriverPhoneChangedEvent,
} from '../../drivers/events/driver.events';
import { DriverCredentialsService } from '../services/driver-credentials.service';

@Injectable()
export class DriverPhoneChangedListener {
  constructor(private readonly credentials: DriverCredentialsService) {}

  @OnEvent(DriverEvents.PHONE_CHANGED, { async: true })
  handle(event: DriverPhoneChangedEvent): Promise<void> {
    return this.credentials.syncLoginPhone(event.driverId, event.phone);
  }
}
