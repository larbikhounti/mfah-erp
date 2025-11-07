import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber } from 'class-validator';

export class UpdateMachineChairDto {
  @ApiPropertyOptional({
    description: 'The name of the machine chair',
    example: 'Chair 1',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description:
      'The status of the machine chair (0: available, 1: maintenance)',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({
    description: 'The ID of the machine this chair belongs to',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  machineId?: number;
}
