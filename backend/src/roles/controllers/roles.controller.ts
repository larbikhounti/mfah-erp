import {
  Body,
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Query,
  Param,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { BulkDeleteRolesDto } from '../dtos/bulk-delete-roles.dto';
import { FilterRolesDto } from '../dtos/filter-roles.dto';
import { Public } from 'src/decorator/public.decorator';
import { RolesService } from '../services/roles.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('roles')
@Controller({
  path: 'roles',
  version: '1',
})
export class RolesController {
  constructor(private rolesService: RolesService) {}

  // === PUBLIC ENDPOINTS ===

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all roles with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of roles retrieved successfully',
  })
  getAllRoles(@Query() filterParams: FilterRolesDto) {
    return this.rolesService.findAll(filterParams);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get role by ID (Public)' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  getRoleById(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  // === ADMIN CRUD OPERATIONS ===

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new role (Admin only)' })
  @ApiResponse({ status: 201, description: 'Role created successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 409, description: 'Role with name already exists' })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get role by ID with admin details (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  getRoleByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update role by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role updated successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({
    status: 409,
    description: 'Name already taken by another role',
  })
  updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete roles by IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Roles deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedCount: { type: 'number' },
        notFound: { type: 'array', items: { type: 'number' } },
        hasRelatedRecords: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  bulkDeleteRoles(@Body() bulkDeleteDto: BulkDeleteRolesDto) {
    return this.rolesService.bulkDelete(bulkDeleteDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete role by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Role deleted successfully' })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete role with related records',
  })
  deleteRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({ summary: 'Get all roles with admin privileges (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'List of roles retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllRolesAdmin(@Query() filterParams: FilterRolesDto) {
    return this.rolesService.findAll(filterParams);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted role (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Role restored successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Role not found' })
  restoreRole(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.restore(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple roles (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Bulk restore completed',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  bulkRestoreRoles(@Body() body: { roleIds: number[] }) {
    return this.rolesService.bulkRestore(body.roleIds);
  }
}
