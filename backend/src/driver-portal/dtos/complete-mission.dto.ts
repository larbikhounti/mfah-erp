import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteMissionDto {
  @ApiProperty({ required: false, description: 'Comment for the ops team' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
