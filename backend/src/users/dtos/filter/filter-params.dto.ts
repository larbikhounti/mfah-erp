import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Type, } from 'class-transformer';
import {ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';


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
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsNumber()
  userId: number;


}
