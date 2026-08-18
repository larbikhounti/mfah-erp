import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TruckStatus } from '@prisma/client';

export class CreateTruckDto {
  @ApiProperty({ description: 'Vehicle plate number', example: '12345-A-6' })
  @IsNotEmpty()
  @IsString()
  plateNumber: string;

  @ApiProperty({ description: 'Truck type', example: 'Semi-remorque' })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Max authorized gross weight (PTAC), in kg',
    example: 26000,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  ptac: number;

  @ApiProperty({
    description: 'Truck status',
    enum: TruckStatus,
    example: TruckStatus.DISPO,
    required: false,
  })
  @IsOptional()
  @IsEnum(TruckStatus)
  status?: TruckStatus;

  @ApiProperty({ description: 'Free-form note', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Insurance expiry date',
    example: '2026-12-31T00:00:00.000Z',
  })
  @Type(() => Date)
  @IsDate()
  insuranceExpiry: Date;
}
