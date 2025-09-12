import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateGameTypeDto {
  @ApiProperty({
    description: 'The name of the game type',
    example: 'Adventure',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
