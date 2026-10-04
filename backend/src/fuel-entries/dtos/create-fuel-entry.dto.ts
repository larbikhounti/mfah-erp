import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNumber, Max, Min } from 'class-validator';
import { Currency } from '@prisma/client';

/** What the driver types on the "Add fuel" screen. */
export class CreateFuelEntryDto {
  @ApiProperty({ example: 320 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @Max(5000)
  litres: number;

  @ApiProperty({ example: 1.12 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 3 })
  @Min(0.001)
  @Max(1000)
  unitPrice: number;

  @ApiProperty({ enum: Currency, example: Currency.EUR })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({ example: 125430, description: 'Odometer reading (km)' })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(10_000_000)
  odometerKm: number;
}
