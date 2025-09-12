import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateMachineTypeDto {
  @ApiProperty({
    description: 'The name of the machine type',
    example: 'VR Headset',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
