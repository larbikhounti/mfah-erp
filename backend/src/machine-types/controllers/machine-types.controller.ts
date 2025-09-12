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
} from '@nestjs/common';
import { CreateMachineTypeDto } from '../dtos/create-machine-type.dto';
import { UpdateMachineTypeDto } from '../dtos/update-machine-type.dto';
import { BulkDeleteMachineTypesDto } from '../dtos/bulk-delete-machine-types.dto';
import { FilterMachineTypesDto } from '../dtos/filter/filter-machine-types.dto';
import { Public } from 'src/decorator/public.decorator';
import { MachineTypesService } from '../services/machine-types.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('machine-types')
@Controller({
  path: 'machine-types',
  version: '1',
})
export class MachineTypesController {
  constructor(private machineTypesService: MachineTypesService) {}

  // === PUBLIC ENDPOINTS ===

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all machine types with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of machine types retrieved successfully',
  })
  getAllMachineTypes(@Query() filterParams: FilterMachineTypesDto) {
    return this.machineTypesService.findAll(filterParams);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get machine type by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Machine type retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Machine type not found' })
  getMachineTypeById(@Param('id', ParseIntPipe) id: number) {
    return this.machineTypesService.getMachineTypeById(id);
  }

  // === ADMIN ENDPOINTS ===

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({
    summary: 'Get all machine types with admin privileges (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of machine types retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllMachineTypesAdmin(@Query() filterParams: FilterMachineTypesDto) {
    return this.machineTypesService.findAll(filterParams);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new machine type (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Machine type created successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({
    status: 409,
    description: 'Machine type with name already exists',
  })
  createMachineTypeByAdmin(@Body() createMachineTypeDto: CreateMachineTypeDto) {
    return this.machineTypesService.createMachineTypeByAdmin(
      createMachineTypeDto,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get machine type by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine type retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Machine type not found' })
  getMachineTypeByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.machineTypesService.getMachineTypeById(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update machine type by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine type updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Machine type not found' })
  @ApiResponse({
    status: 409,
    description: 'Name already taken by another machine type',
  })
  updateMachineTypeByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMachineTypeDto: UpdateMachineTypeDto,
  ) {
    return this.machineTypesService.updateMachineTypeByAdmin(
      id,
      updateMachineTypeDto,
    );
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete machine type by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine type deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Machine type not found' })
  deleteMachineTypeByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.machineTypesService.deleteMachineTypeByAdmin(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete machine types by IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine types deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        deletedCount: { type: 'number' },
        notFound: { type: 'array', items: { type: 'number' } },
      },
    },
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 400, description: 'Invalid request body' })
  bulkDeleteMachineTypesByAdmin(
    @Body() bulkDeleteDto: BulkDeleteMachineTypesDto,
  ) {
    return this.machineTypesService.bulkDeleteMachineTypesByAdmin(
      bulkDeleteDto,
    );
  }
}
