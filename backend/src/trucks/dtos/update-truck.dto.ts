import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { TruckStatus } from '@prisma/client';

export class UpdateTruckDto {
  @ApiProperty({ description: 'Vehicle plate number', required: false })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiProperty({ description: 'Truck type', required: false })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiProperty({
    description: 'Max authorized gross weight (PTAC), in kg',
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  ptac?: number;

  @ApiProperty({
    description: 'Truck status',
    enum: TruckStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(TruckStatus)
  status?: TruckStatus;

  @ApiProperty({ description: 'Free-form note', required: false })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ description: 'Insurance expiry date', required: false })
  @Type(() => Date)
  @IsOptional()
  @IsDate()
  insuranceExpiry?: Date;
}
