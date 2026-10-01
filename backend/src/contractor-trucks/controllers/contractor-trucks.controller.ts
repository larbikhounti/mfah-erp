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
import { PermissionModule } from '@prisma/client';
import { CreateContractorTruckDto } from '../dtos/create-contractor-truck.dto';
import { UpdateContractorTruckDto } from '../dtos/update-contractor-truck.dto';
import { BulkDeleteContractorTrucksDto } from '../dtos/bulk-delete-contractor-trucks.dto';
import { FilterContractorTrucksDto } from '../dtos/filter-contractor-trucks.dto';
import { ContractorTrucksService } from '../services/contractor-trucks.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';

// A subcontractor's own trucks — tracked so a SUBCONTRACTED mission can
// record which specific vehicle is doing the job. Internal ops data, same
// guard pattern as every other ERP module.
@ApiTags('contractor-trucks')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'contractor-trucks',
  version: '1',
})
export class ContractorTrucksController {
  constructor(private contractorTrucksService: ContractorTrucksService) {}

  @Get()
  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'read')
  @ApiOperation({ summary: 'Get all contractor trucks with filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of contractor trucks retrieved successfully',
  })
  getAllContractorTrucks(@Query() filterParams: FilterContractorTrucksDto) {
    return this.contractorTrucksService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'read')
  @ApiOperation({ summary: 'Get contractor truck by ID' })
  @ApiResponse({
    status: 200,
    description: 'Contractor truck retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Contractor truck not found' })
  getContractorTruckById(@Param('id', ParseIntPipe) id: number) {
    return this.contractorTrucksService.findOne(id);
  }

  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new contractor truck' })
  @ApiResponse({
    status: 201,
    description: 'Contractor truck created successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Contractor truck with plate number already exists',
  })
  createContractorTruck(@Body() dto: CreateContractorTruckDto) {
    return this.contractorTrucksService.create(dto);
  }

  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update contractor truck by ID' })
  @ApiResponse({
    status: 200,
    description: 'Contractor truck updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Contractor truck not found' })
  updateContractorTruck(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateContractorTruckDto,
  ) {
    return this.contractorTrucksService.update(id, dto);
  }

  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete contractor trucks by IDs' })
  bulkDeleteContractorTrucks(@Body() dto: BulkDeleteContractorTrucksDto) {
    return this.contractorTrucksService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete contractor truck by ID' })
  @ApiResponse({
    status: 200,
    description: 'Contractor truck deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Contractor truck not found' })
  deleteContractorTruck(@Param('id', ParseIntPipe) id: number) {
    return this.contractorTrucksService.remove(id);
  }

  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted contractor truck' })
  restoreContractorTruck(@Param('id', ParseIntPipe) id: number) {
    return this.contractorTrucksService.restore(id);
  }

  @RequirePermission(PermissionModule.CONTRACTOR_TRUCKS, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple contractor trucks' })
  bulkRestoreContractorTrucks(@Body() body: { contractorTruckIds: number[] }) {
    return this.contractorTrucksService.bulkRestore(body.contractorTruckIds);
  }
}
