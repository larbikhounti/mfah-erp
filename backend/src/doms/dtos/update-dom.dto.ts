import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateDomDto {
  @ApiProperty({
    description: 'The name of the DOM',
    example: 'VR Experience Center',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'The address of the DOM',
    example: '123 Main Street, City, State 12345',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
}
