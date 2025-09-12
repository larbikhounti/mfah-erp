import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateMachineTypeDto {
  @ApiProperty({
    description: 'The name of the machine type',
    example: 'VR Headset Pro',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
