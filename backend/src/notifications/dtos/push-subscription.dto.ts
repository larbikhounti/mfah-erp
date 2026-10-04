import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator';

class PushSubscriptionKeysDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  p256dh: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  auth: string;
}

/** The browser's PushSubscription.toJSON() shape. */
export class PushSubscriptionDto {
  @ApiProperty()
  @IsUrl({ protocols: ['https'], require_tld: false })
  endpoint: string;

  @ApiProperty({ type: PushSubscriptionKeysDto })
  @ValidateNested()
  @Type(() => PushSubscriptionKeysDto)
  keys: PushSubscriptionKeysDto;

  // Part of what browsers send (almost always null); accepted so the
  // whitelist validation doesn't reject it, but not stored.
  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @IsNumber()
  expirationTime?: number | null;
}

export class UnsubscribeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  endpoint: string;
}
