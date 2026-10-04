import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';

export const MISSION_BUCKETS = ['active', 'upcoming', 'completed'] as const;
export type MissionBucket = (typeof MISSION_BUCKETS)[number];

export class FilterDriverMissionsDto {
  @ApiProperty({ enum: MISSION_BUCKETS, required: false })
  @IsOptional()
  @IsIn(MISSION_BUCKETS)
  bucket?: MissionBucket;

  @ApiProperty({ required: false, example: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({ required: false, example: 20 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
