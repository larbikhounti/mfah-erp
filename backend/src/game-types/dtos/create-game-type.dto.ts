import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateGameTypeDto {
  @ApiProperty({
    description: 'The name of the game type',
    example: 'Action',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
