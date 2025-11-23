import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FilterParamsDto {
  @ApiPropertyOptional({ description: 'Offset for pagination' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  offset?: number;

  @ApiPropertyOptional({ description: 'Limit for pagination' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number;

  @ApiPropertyOptional({ description: 'Search term' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by status' })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiPropertyOptional({ description: 'Filter by machine ID' })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  machineId?: number;

  @ApiPropertyOptional({
    description: 'Show archived/deleted items',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  showArchived?: boolean;
}
