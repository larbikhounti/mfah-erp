import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class FilterDomsDto {
  @ApiProperty({
    description: 'Number of records to skip',
    example: 0,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiProperty({
    description: 'Number of records to return',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for name or address',
    example: 'VR Center',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Specific DOM ID to filter by',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  domId?: number;
}
