import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TruckStatus } from '@prisma/client';

export class FilterTrucksDto {
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
    description: 'Search term (plate number or type)',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: TruckStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TruckStatus)
  status?: TruckStatus;

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
