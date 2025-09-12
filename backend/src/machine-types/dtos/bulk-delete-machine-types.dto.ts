import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, Min, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkDeleteMachineTypesDto {
  @ApiProperty({
    description: 'Array of machine type IDs to delete',
    example: [1, 2, 3],
    type: [Number],
  })
  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  machineTypeIds: number[];
}
