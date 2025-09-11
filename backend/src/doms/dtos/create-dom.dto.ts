import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDomDto {
  @ApiProperty({
    description: 'The name of the DOM',
    example: 'VR Experience Center',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The address of the DOM',
    example: '123 Main Street, City, State 12345',
  })
  @IsNotEmpty()
  @IsString()
  address: string;
}
