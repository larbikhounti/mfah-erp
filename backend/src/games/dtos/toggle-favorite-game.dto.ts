import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsBoolean } from 'class-validator';

export class ToggleFavoriteGameDto {
  @ApiProperty({
    description: 'Whether the game should be marked as favored',
    example: true,
  })
  @IsNotEmpty()
  @IsBoolean()
  isFavored: boolean;
}
