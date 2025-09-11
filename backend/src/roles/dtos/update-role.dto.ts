import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @ApiProperty({
    description: 'The name of the role',
    example: 'Admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string;
}
