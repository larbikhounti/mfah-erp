import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class FilterDriverFuelDto {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  missionId?: number;

  @ApiProperty({ required: false, example: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({ required: false, example: 30 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 30;
}
