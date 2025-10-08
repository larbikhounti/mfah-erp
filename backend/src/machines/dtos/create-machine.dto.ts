import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateMachineDto {
  @ApiProperty({
    description: 'The name of the machine',
    example: 'VR Station 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'The machine type ID',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  machineTypeId?: number;

  @ApiProperty({
    description: 'The DOM ID where the machine is located',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  domeId?: number;

  @ApiProperty({
    description: 'Number of chairs to create for this machine',
    example: 4,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20) // Reasonable limit for number of chairs
  chairsNumber?: number;

  @ApiProperty({
    description: 'The alias for the machine',
    example: 'A',
  })
  @IsNotEmpty()
  @IsString()
  alias: string;
}
