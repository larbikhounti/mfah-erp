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
    description: 'Scheduled mission date',
    example: '2026-09-01T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  missionDate: Date;

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
