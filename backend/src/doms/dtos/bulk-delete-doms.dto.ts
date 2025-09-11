import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min, ArrayNotEmpty } from 'class-validator';

export class BulkDeleteDomsDto {
  @ApiProperty({
    description: 'Array of DOM IDs to delete',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(1, { each: true })
  domIds: number[];
}
