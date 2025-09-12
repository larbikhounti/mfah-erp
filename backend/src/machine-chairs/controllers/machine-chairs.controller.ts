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
import { CreateMachineChairDto } from '../dtos/create-machine-chair.dto';
import { UpdateMachineChairDto } from '../dtos/update-machine-chair.dto';
import { BulkDeleteMachineChairsDto } from '../dtos/bulk-delete-machine-chairs.dto';
import { MachineChairsService } from '../services/machine-chairs.service';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';

@ApiTags('machine-chairs')
@Controller({
  path: 'machine-chairs',
  version: '1',
})
export class MachineChairsController {
  constructor(private machineChairsService: MachineChairsService) {}

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/list/all')
  @ApiOperation({
    summary: 'Get all machine chairs with admin privileges (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of machine chairs retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  async findAll(@Query() filterParams: FilterParamsDto) {
    return this.machineChairsService.findAll(filterParams);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Get('admin/:id')
  @ApiOperation({
    summary: 'Get machine chair by ID with admin privileges (Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Machine chair retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Machine chair not found',
  })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.machineChairsService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Post('admin/create')
  @ApiOperation({ summary: 'Create a new machine chair (Admin only)' })
  @ApiResponse({
    status: 201,
    description: 'Machine chair created successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async create(@Body() createMachineChairDto: CreateMachineChairDto) {
    return this.machineChairsService.create(createMachineChairDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Put('admin/update/:id')
  @ApiOperation({ summary: 'Update machine chair by ID (Admin only)' })
  @ApiResponse({
    status: 200,
    description: 'Machine chair updated successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Machine chair not found',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMachineChairDto: UpdateMachineChairDto,
  ) {
    return this.machineChairsService.update(id, updateMachineChairDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/delete/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete machine chair by ID (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Machine chair deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 404,
    description: 'Machine chair not found',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.machineChairsService.remove(id);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard, AdminRoleGuard)
  @Delete('admin/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Bulk delete machine chairs (Admin only)' })
  @ApiResponse({
    status: 204,
    description: 'Machine chairs deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  async bulkDelete(
    @Body() bulkDeleteMachineChairsDto: BulkDeleteMachineChairsDto,
  ) {
    return this.machineChairsService.bulkDelete(bulkDeleteMachineChairsDto);
  }

  @ApiBearerAuth('access-token')
  @UseGuards(AuthGuard)
  @Get('machine/:machineId')
  @ApiOperation({ summary: 'Get machine chairs by machine ID' })
  @ApiResponse({
    status: 200,
    description: 'Machine chairs retrieved successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async findByMachineId(@Param('machineId', ParseIntPipe) machineId: number) {
    return this.machineChairsService.findByMachineId(machineId);
  }
}
