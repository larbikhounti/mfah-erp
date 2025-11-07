import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  IsNumber,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterGamesDto {
  @ApiPropertyOptional({
    description: 'Filter by game name (partial match)',
    example: 'Virtual',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Filter by game type ID',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  gameTypeId?: number;

  @ApiPropertyOptional({
    description: 'Filter by machine type IDs',
    example: [1, 2],
  })
  @IsOptional()
  @IsInt({ each: true })
  @Type(() => Number)
  @Min(1, { each: true })
  machineTypeIds?: number[];

  @ApiPropertyOptional({
    description: 'Filter by minimum price',
    example: 10.0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum price',
    example: 50.0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Filter by minimum play time (minutes)',
    example: 15,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  minPlayTime?: number;

  @ApiPropertyOptional({
    description: 'Filter by maximum play time (minutes)',
    example: 60,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  maxPlayTime?: number;

  @ApiPropertyOptional({
    description: 'Filter by favored status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isFavored?: boolean;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
