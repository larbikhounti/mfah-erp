import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class UpdateDriverDto {
  @ApiProperty({ description: 'Full name', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ description: 'National ID (CIN)', required: false })
  @IsOptional()
  @IsString()
  cin?: string;

  @ApiProperty({ description: 'Phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Driver status',
    enum: DriverStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @ApiProperty({ description: 'Free-form note', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}
