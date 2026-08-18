import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEnum, ValidateNested } from 'class-validator';
import { PermissionModule } from '@prisma/client';

export class PermissionEntryDto {
  @ApiProperty({
    description: 'The module this permission entry applies to',
    enum: PermissionModule,
    example: PermissionModule.TRUCKS,
  })
  @IsEnum(PermissionModule)
  module: PermissionModule;

  @ApiProperty({
    description: 'Can create records in this module',
    example: false,
  })
  @IsBoolean()
  canCreate: boolean;

  @ApiProperty({
    description: 'Can read records in this module',
    example: true,
  })
  @IsBoolean()
  canRead: boolean;

  @ApiProperty({
    description: 'Can update records in this module',
    example: false,
  })
  @IsBoolean()
  canUpdate: boolean;

  @ApiProperty({
    description: 'Can delete records in this module',
    example: false,
  })
  @IsBoolean()
  canDelete: boolean;
}

export class SetRolePermissionsDto {
  @ApiProperty({
    description:
      'The full set of module permissions for this role. Modules omitted from the array are left unchanged.',
    type: [PermissionEntryDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PermissionEntryDto)
  permissions: PermissionEntryDto[];
}
