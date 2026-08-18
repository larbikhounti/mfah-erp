import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { DriverStatus } from '@prisma/client';

export class CreateDriverDto {
  @ApiProperty({ description: 'Full name', example: 'Ahmed El Amrani' })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({ description: 'National ID (CIN)', example: 'AB123456' })
  @IsNotEmpty()
  @IsString()
  cin: string;

  @ApiProperty({ description: 'Phone number', example: '+212600000000' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description: 'Driver status',
    enum: DriverStatus,
    example: DriverStatus.ACTIF,
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
