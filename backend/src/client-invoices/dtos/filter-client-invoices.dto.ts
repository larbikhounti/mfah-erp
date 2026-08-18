import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Currency, InvoiceStatus } from '@prisma/client';

export class FilterClientInvoicesDto {
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

  @ApiProperty({ description: 'Search term (invoice number)', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filter by status',
    enum: InvoiceStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

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

  @ApiProperty({ description: 'Filter by mission ID', required: false })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  missionId?: number;

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
