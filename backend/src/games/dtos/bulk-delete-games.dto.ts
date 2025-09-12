import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min } from 'class-validator';

export class BulkDeleteGamesDto {
  @ApiProperty({
    description: 'Array of game IDs to delete',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @IsInt({ each: true })
  @Min(1, { each: true })
  ids: number[];
}
