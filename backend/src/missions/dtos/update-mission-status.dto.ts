import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { MissionStatus } from '@prisma/client';

export class UpdateMissionStatusDto {
  @ApiProperty({ description: 'New mission status', enum: MissionStatus })
  @IsEnum(MissionStatus)
  status: MissionStatus;
}
