import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { AttachmentCategory } from '@prisma/client';

export const CLOSURE_FILE_CATEGORIES = [
  AttachmentCategory.CMR,
  AttachmentCategory.ODOMETER_PHOTO,
] as const;

export class UploadClosureFileDto {
  @ApiProperty({ enum: CLOSURE_FILE_CATEGORIES })
  @IsIn(CLOSURE_FILE_CATEGORIES)
  category: (typeof CLOSURE_FILE_CATEGORIES)[number];
}
