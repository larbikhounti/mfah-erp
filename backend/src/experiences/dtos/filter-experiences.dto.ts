import { IsOptional, IsInt, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterExperiencesDto {
  @ApiPropertyOptional({
    description: 'Offset for pagination',
    type: Number,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({
    description: 'Limit for pagination',
    type: Number,
    minimum: 1,
    maximum: 100,
    default: 25,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  limit?: number = 25;

  @ApiPropertyOptional({
    description: 'Search term for experience filtering',
    type: String,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by experience ID',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  experienceId?: number;

  @ApiPropertyOptional({
    description: 'Filter by machine ID',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  machineId?: number;

  @ApiPropertyOptional({
    description: 'Filter by game ID',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  gameId?: number;

  @ApiPropertyOptional({
    description: 'Filter by dome ID',
    type: Number,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  domeId?: number;
}
