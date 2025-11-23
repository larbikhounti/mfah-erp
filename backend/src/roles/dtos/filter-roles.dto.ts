import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class FilterRolesDto {
  @ApiProperty({
    description: 'Number of records to skip',
    example: 0,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  offset?: number = 0;

  @ApiProperty({
    description: 'Number of records to return',
    example: 10,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({
    description: 'Search term for role name',
    example: 'Admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Specific role ID to filter by',
    example: 1,
    required: false,
  })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  roleId?: number;

  @ApiProperty({
    description: 'Show archived/deleted items',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  showArchived?: boolean;
}
