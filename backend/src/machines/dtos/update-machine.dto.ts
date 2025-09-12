import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class UpdateMachineDto {
  @ApiProperty({
    description: 'The name of the machine',
    example: 'VR Station Pro 1',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;

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
}
