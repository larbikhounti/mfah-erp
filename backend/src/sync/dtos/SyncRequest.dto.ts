// src/sync/dto/sync-request.dto.ts
import { ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsInt, IsISO8601 } from 'class-validator';

export class SyncRequestDto {
  @ApiProperty({ type: Number })
  @IsInt()
  domeId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  lastSync: Date;
}
