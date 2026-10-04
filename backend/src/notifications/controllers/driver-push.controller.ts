import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DriverEndpoint } from '../../driver-auth/decorators/driver-endpoint.decorator';
import { CurrentDriver } from '../../driver-auth/decorators/current-driver.decorator';
import { DriverSession } from '../../driver-auth/types/driver-session.type';
import { WebPushService } from '../services/web-push.service';
import { PushSubscriptionsService } from '../services/push-subscriptions.service';
import {
  PushSubscriptionDto,
  UnsubscribeDto,
} from '../dtos/push-subscription.dto';

@ApiTags('driver-portal')
@DriverEndpoint()
@Controller({ path: 'driver/push', version: '1' })
export class DriverPushController {
  constructor(
    private readonly webPush: WebPushService,
    private readonly subscriptions: PushSubscriptionsService,
  ) {}

  @Get('public-key')
  @ApiOperation({
    summary:
      'VAPID public key the browser subscribes with (null = push disabled)',
  })
  publicKey() {
    return { publicKey: this.webPush.getPublicKey() };
  }

  @Post('subscriptions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register this browser for push notifications' })
  subscribe(
    @CurrentDriver() driver: DriverSession,
    @Body() dto: PushSubscriptionDto,
    @Headers('user-agent') userAgent?: string,
  ) {
    return this.subscriptions.subscribe(driver.id, dto, userAgent);
  }

  @Delete('subscriptions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Stop push notifications on this browser' })
  unsubscribe(
    @CurrentDriver() driver: DriverSession,
    @Body() dto: UnsubscribeDto,
  ) {
    return this.subscriptions.unsubscribe(driver.id, dto.endpoint);
  }
}
