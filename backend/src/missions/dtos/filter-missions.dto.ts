import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  Currency,
  ExecutionMode,
  MissionStatus,
  TransportType,
} from '@prisma/client';

export class FilterMissionsDto {
  @ApiProperty({
    description: 'Number of records to skip',
    example: 0,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  offset?: number = 0;

  @ApiProperty({
    description: 'Number of records to return',
    example: 10,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term (reference, loading/delivery location)',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: MissionStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(MissionStatus)
  status?: MissionStatus;

  @ApiProperty({
    description: 'Filter by transport type',
    enum: TransportType,
    required: false,
  })
  @IsOptional()
  @IsEnum(TransportType)
  transportType?: TransportType;

  @ApiProperty({
    description: 'Filter by execution mode',
    enum: ExecutionMode,
    required: false,
  })
  @IsOptional()
  @IsEnum(ExecutionMode)
  executionMode?: ExecutionMode;

  @ApiProperty({
    description: 'Filter by currency',
    enum: Currency,
    required: false,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({ description: 'Filter by client ID', required: false })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  clientId?: number;

  @ApiProperty({ description: 'Filter by subcontractor ID', required: false })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  subcontractorId?: number;

  @ApiProperty({ description: 'Filter by truck ID', required: false })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  truckId?: number;

  @ApiProperty({ description: 'Filter by driver ID', required: false })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  driverId?: number;

  @ApiProperty({
    description: 'Mission date range start (inclusive)',
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'Mission date range end (inclusive)',
    required: false,
  })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @ApiProperty({
    description: 'Show archived/deleted items',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  showArchived?: boolean;
}
