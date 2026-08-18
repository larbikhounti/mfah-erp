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
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PermissionModule } from '@prisma/client';
import { CreateTruckDto } from '../dtos/create-truck.dto';
import { UpdateTruckDto } from '../dtos/update-truck.dto';
import { BulkDeleteTrucksDto } from '../dtos/bulk-delete-trucks.dto';
import { FilterTrucksDto } from '../dtos/filter-trucks.dto';
import { TrucksService } from '../services/trucks.service';
import { AttachmentsService } from '../../attachments/services/attachments.service';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';

// Fleet data is internal ops data, not a public catalog — every route here
// requires authentication; module-level create/read/update/delete rights
// are governed by PermissionGuard (admins bypass it entirely).
@ApiTags('trucks')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'trucks',
  version: '1',
})
export class TrucksController {
  constructor(
    private trucksService: TrucksService,
    private attachmentsService: AttachmentsService,
  ) {}

  @Get()
  @RequirePermission(PermissionModule.TRUCKS, 'read')
  @ApiOperation({ summary: 'Get all trucks with filtering' })
  @ApiResponse({
    status: 200,
    description: 'List of trucks retrieved successfully',
  })
  getAllTrucks(@Query() filterParams: FilterTrucksDto) {
    return this.trucksService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.TRUCKS, 'read')
  @ApiOperation({ summary: 'Get truck by ID' })
  @ApiResponse({ status: 200, description: 'Truck retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Truck not found' })
  getTruckById(@Param('id', ParseIntPipe) id: number) {
    return this.trucksService.findOne(id);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new truck' })
  @ApiResponse({ status: 201, description: 'Truck created successfully' })
  @ApiResponse({
    status: 409,
    description: 'Truck with plate number already exists',
  })
  createTruck(@Body() dto: CreateTruckDto) {
    return this.trucksService.create(dto);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update truck by ID' })
  @ApiResponse({ status: 200, description: 'Truck updated successfully' })
  @ApiResponse({ status: 404, description: 'Truck not found' })
  updateTruck(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTruckDto,
  ) {
    return this.trucksService.update(id, dto);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete trucks by IDs' })
  bulkDeleteTrucks(@Body() dto: BulkDeleteTrucksDto) {
    return this.trucksService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete truck by ID' })
  @ApiResponse({ status: 200, description: 'Truck deleted successfully' })
  @ApiResponse({ status: 404, description: 'Truck not found' })
  deleteTruck(@Param('id', ParseIntPipe) id: number) {
    return this.trucksService.remove(id);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted truck' })
  restoreTruck(@Param('id', ParseIntPipe) id: number) {
    return this.trucksService.restore(id);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple trucks' })
  bulkRestoreTrucks(@Body() body: { truckIds: number[] }) {
    return this.trucksService.bulkRestore(body.truckIds);
  }

  // === Attachments (insurance docs, inspection reports, etc. — the
  // uploader names each one via `label` so it stays recognizable later) ===

  @RequirePermission(PermissionModule.TRUCKS, 'read')
  @Get(':id/attachments')
  @ApiOperation({ summary: "List a truck's attachments" })
  listAttachments(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findForTruck(id);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'update')
  @Post('admin/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment for a truck' })
  async uploadAttachment(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('label') label?: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (!label?.trim()) {
      throw new BadRequestException('label is required');
    }
    await this.trucksService.findOne(id);
    return this.attachmentsService.uploadForTruck(id, label.trim(), file);
  }

  @RequirePermission(PermissionModule.TRUCKS, 'update')
  @Delete('admin/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a truck attachment' })
  deleteAttachment(@Param('attachmentId', ParseIntPipe) attachmentId: number) {
    return this.attachmentsService.remove(attachmentId);
  }
}
