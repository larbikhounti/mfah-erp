import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateClientDto {
  @ApiProperty({ description: 'Company name', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({ description: 'Address', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: 'Primary contact name', required: false })
  @IsOptional()
  @IsString()
  contactName?: string;

  @ApiProperty({ description: 'Primary contact phone', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ description: 'Primary contact email', required: false })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @ApiProperty({ description: 'ICE', required: false })
  @IsOptional()
  @IsString()
  ice?: string;

  @ApiProperty({ description: 'Bank name', required: false })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiProperty({ description: 'Bank RIB', required: false })
  @IsOptional()
  @IsString()
  bankRib?: string;

  @ApiProperty({ description: 'Bank IBAN', required: false })
  @IsOptional()
  @IsString()
  bankIban?: string;

  @ApiProperty({ description: 'Bank SWIFT/BIC', required: false })
  @IsOptional()
  @IsString()
  bankSwift?: string;
}
