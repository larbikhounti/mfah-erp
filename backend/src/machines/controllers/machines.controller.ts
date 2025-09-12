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
import { CreateMachineDto } from '../dtos/create-machine.dto';
import { UpdateMachineDto } from '../dtos/update-machine.dto';
import { BulkDeleteMachinesDto } from '../dtos/bulk-delete-machines.dto';
import { FilterMachinesDto } from '../dtos/filter/filter-machines.dto';
import { Public } from 'src/decorator/public.decorator';
import { MachinesService } from '../services/machines.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('machines')
@Controller({
  path: 'machines',
  version: '1',
})
export class MachinesController {
  constructor(private machinesService: MachinesService) {}

  // === PUBLIC ENDPOINTS ===

  @Public()
  @Get('all')
  @ApiOperation({ summary: 'Get all machines with filtering (Public)' })
  @ApiResponse({
    status: 200,
    description: 'List of machines retrieved successfully',
  })
  getAllMachines(@Query() filterParams: FilterMachinesDto) {
    return this.machinesService.findAll(filterParams);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get machine by ID (Public)' })
  @ApiResponse({
    status: 200,
    description: 'Machine retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  getMachineById(@Param('id', ParseIntPipe) id: number) {
    return this.machinesService.getMachineById(id);
  }

  // === ADMIN ENDPOINTS ===

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({
    summary: 'Get all machines with admin privileges (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of machines retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  getAllMachinesAdmin(@Query() filterParams: FilterMachinesDto) {
    return this.machinesService.findAll(filterParams);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new machine (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Machine created successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({
    status: 409,
    description: 'Machine with name already exists',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid machine type or DOM ID',
  })
  createMachineByAdmin(@Body() createMachineDto: CreateMachineDto) {
    return this.machinesService.createMachineByAdmin(createMachineDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({ summary: 'Get machine by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine retrieved successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  getMachineByIdAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.machinesService.getMachineById(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update machine by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine updated successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  @ApiResponse({
    status: 409,
    description: 'Name already taken by another machine',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid machine type or DOM ID',
  })
  updateMachineByAdmin(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMachineDto: UpdateMachineDto,
  ) {
    return this.machinesService.updateMachineByAdmin(id, updateMachineDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete machines by IDs (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machines deleted successfully',
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
  bulkDeleteMachinesByAdmin(@Body() bulkDeleteDto: BulkDeleteMachinesDto) {
    return this.machinesService.bulkDeleteMachinesByAdmin(bulkDeleteDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete machine by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine deleted successfully',
  })
  @ApiResponse({ status: 403, description: 'Admin access required' })
  @ApiResponse({ status: 404, description: 'Machine not found' })
  deleteMachineByAdmin(@Param('id', ParseIntPipe) id: number) {
    return this.machinesService.deleteMachineByAdmin(id);
  }
}
