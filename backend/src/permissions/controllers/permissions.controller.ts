import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';
import { PermissionsService } from '../services/permissions.service';
import { SetRolePermissionsDto } from '../dtos/set-role-permissions.dto';

// Managing who can grant module access is itself admin-only — there is no
// public/read split here like the roles/users modules, since this endpoint
// controls every other module's access.
@ApiTags('permissions')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, AdminRoleGuard)
@Controller({
  path: 'permissions',
  version: '1',
})
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @Get('roles/:roleId')
  @ApiOperation({ summary: "Get a role's module permissions (Admin only)" })
  @ApiResponse({
    status: 200,
    description: 'Permissions retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  getRolePermissions(@Param('roleId', ParseIntPipe) roleId: number) {
    return this.permissionsService.findByRole(roleId);
  }

  @Put('roles/:roleId')
  @ApiOperation({ summary: "Set a role's module permissions (Admin only)" })
  @ApiResponse({
    status: 200,
    description: 'Permissions updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Role not found' })
  setRolePermissions(
    @Param('roleId', ParseIntPipe) roleId: number,
    @Body() dto: SetRolePermissionsDto,
  ) {
    return this.permissionsService.setForRole(roleId, dto);
  }
}
