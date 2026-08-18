import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsOptional } from 'class-validator';

export class DashboardSummaryQueryDto {
  @ApiProperty({
    description: 'Mission date range start (inclusive)',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiProperty({
    description: 'Mission date range end (inclusive)',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiProperty({
    description: 'Number of records to skip in the missions table',
    example: 0,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  offset?: number = 0;

  @ApiProperty({
    description: 'Number of records to return in the missions table',
    example: 10,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}
