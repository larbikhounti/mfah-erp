import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'The content of the comment',
    example: 'Customer requested additional time',
  })
  @IsNotEmpty()
  @IsString()
  content: string;
}
