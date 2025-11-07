import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateMachineChairDto {
  @ApiProperty({
    description: 'The name of the machine chair',
    example: 'Chair 1',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'The status of the machine chair (0: available, 1: maintenance)',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  status: number;

  @ApiProperty({
    description: 'The ID of the machine this chair belongs to',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  machineId: number;
}
