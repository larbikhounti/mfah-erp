import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'The content of the comment',
    example: 'Customer requested additional time',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;
}
