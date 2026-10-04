import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Currency, ExecutionMode, TransportType } from '@prisma/client';

export class CreateMissionDto {
  @ApiProperty({ description: 'Client ID', example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  clientId: number;

  @ApiProperty({ description: 'Transport type', enum: TransportType })
  @IsEnum(TransportType)
  transportType: TransportType;

  @ApiProperty({
    description: 'Whether MFAH handles this mission in-house or outsources it',
    enum: ExecutionMode,
  })
  @IsEnum(ExecutionMode)
  executionMode: ExecutionMode;

  @ApiProperty({ description: 'Loading location', example: 'Tanger Med' })
  @IsNotEmpty()
  @IsString()
  loadingLocation: string;

  @ApiProperty({ description: 'Delivery location', example: 'Rotterdam' })
  @IsNotEmpty()
  @IsString()
  deliveryLocation: string;

  @ApiProperty({ description: 'Price billed to the client', example: 15000 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  clientPrice: number;

  @ApiProperty({ description: 'Currency', enum: Currency })
  @IsEnum(Currency)
  currency: Currency;

  @ApiProperty({
    description:
      'EUR→MAD exchange rate (1 EUR = x MAD) — optional, only kept when currency is EUR',
    required: false,
    example: 10.93,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.0001)
  exchangeRate?: number | null;

  @ApiProperty({
    description:
      'Subcontractor ID — required when executionMode is SUBCONTRACTED',
    required: false,
  })
  @ValidateIf((o) => o.executionMode === ExecutionMode.SUBCONTRACTED)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  subcontractorId?: number;

  @ApiProperty({
    description:
      'Cost paid to the subcontractor — required when executionMode is SUBCONTRACTED',
    required: false,
  })
  @ValidateIf((o) => o.executionMode === ExecutionMode.SUBCONTRACTED)
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  subcontractorCost?: number;

  @ApiProperty({
    description: 'Truck ID — required when executionMode is IN_HOUSE',
    required: false,
  })
  @ValidateIf((o) => o.executionMode === ExecutionMode.IN_HOUSE)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  truckId?: number;

  @ApiProperty({
    description: 'Driver ID — required when executionMode is IN_HOUSE',
    required: false,
  })
  @ValidateIf((o) => o.executionMode === ExecutionMode.IN_HOUSE)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  driverId?: number;

  @ApiProperty({
    description:
      "One of the subcontractor's own trucks doing the job — optional, only applies when executionMode is SUBCONTRACTED",
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  contractorTruckId?: number;

  @ApiProperty({
    description: 'Scheduled loading date and time',
    example: '2026-09-01T08:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  missionDate: Date;

  @ApiProperty({
    description: 'Expected delivery date',
    required: false,
    example: '2026-09-03T00:00:00.000Z',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  expectedDeliveryDate?: Date | null;

  @ApiProperty({
    description: 'Goods carried',
    required: false,
    example: 'Automotive parts',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  goods?: string | null;

  @ApiProperty({
    description: 'Load weight (kg)',
    required: false,
    example: 20000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  weightKg?: number | null;

  @ApiProperty({
    description: "The client's own reference for this job",
    required: false,
    example: 'K+N / AGC',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  clientReference?: string | null;

  @ApiProperty({
    description:
      'Automatically create the client invoice when this mission is created',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  autoInvoice?: boolean;
}
