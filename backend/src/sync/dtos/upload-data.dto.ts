// src/sync/dtos/upload-data.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsISO8601,
  IsOptional,
  IsString,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UploadExperienceDto {
  @ApiProperty({ type: Number })
  @IsInt()
  id: number;

  @ApiProperty({ type: Number })
  @IsInt()
  machineId: number;

  @ApiProperty({ type: Number })
  @IsInt()
  gameId: number;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isFractioned: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isNext: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isStarted: boolean;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isEnded: boolean;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @IsISO8601()
  startedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @IsISO8601()
  endedAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  updatedAt: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @IsISO8601()
  deletedAt: Date | null;

  @ApiProperty({ type: Number })
  @IsInt()
  domeId: number;
}

export class UploadTicketDto {
  @ApiProperty({ type: Number })
  @IsInt()
  id: number;

  @ApiProperty({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  userId: number | null;

  @ApiProperty({ type: Number })
  @IsInt()
  experienceId: number;

  @ApiProperty({ type: String })
  @IsString()
  alias: string;

  @ApiProperty({ type: Boolean })
  @IsBoolean()
  isPaid: boolean;

  @ApiProperty({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  chairId: number | null;

  @ApiProperty({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  couponId: number | null;

  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  notes: string | null;

  @ApiProperty({ type: Number, nullable: true })
  @IsOptional()
  @IsNumber()
  price: number | null;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  @IsISO8601()
  updatedAt: Date;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  @IsOptional()
  @IsISO8601()
  deletedAt: Date | null;

  @ApiProperty({ type: Number })
  @IsInt()
  domeId: number;

  @ApiProperty({ type: Number, nullable: true })
  @IsOptional()
  @IsInt()
  parentTicketId: number | null;
}

export class UploadDataDto {
  @ApiProperty({ type: Number })
  @IsInt()
  domId: number;

  @ApiProperty({ type: [UploadExperienceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadExperienceDto)
  experiences: UploadExperienceDto[];

  @ApiProperty({ type: [UploadTicketDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UploadTicketDto)
  tickets: UploadTicketDto[];
}
