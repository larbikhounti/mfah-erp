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
import { CreateDriverDto } from '../dtos/create-driver.dto';
import { UpdateDriverDto } from '../dtos/update-driver.dto';
import { BulkDeleteDriversDto } from '../dtos/bulk-delete-drivers.dto';
import { FilterDriversDto } from '../dtos/filter-drivers.dto';
import { DriversService } from '../services/drivers.service';
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

@ApiTags('drivers')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'drivers',
  version: '1',
})
export class DriversController {
  constructor(
    private driversService: DriversService,
    private attachmentsService: AttachmentsService,
  ) {}

  @Get()
  @RequirePermission(PermissionModule.DRIVERS, 'read')
  @ApiOperation({ summary: 'Get all drivers with filtering' })
  getAllDrivers(@Query() filterParams: FilterDriversDto) {
    return this.driversService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.DRIVERS, 'read')
  @ApiOperation({ summary: 'Get driver by ID' })
  @ApiResponse({ status: 404, description: 'Driver not found' })
  getDriverById(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findOne(id);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new driver' })
  @ApiResponse({
    status: 409,
    description: 'Driver with this CIN already exists',
  })
  createDriver(@Body() dto: CreateDriverDto) {
    return this.driversService.create(dto);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update driver by ID' })
  updateDriver(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.driversService.update(id, dto);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete drivers by IDs' })
  bulkDeleteDrivers(@Body() dto: BulkDeleteDriversDto) {
    return this.driversService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete driver by ID' })
  deleteDriver(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.remove(id);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted driver' })
  restoreDriver(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.restore(id);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple drivers' })
  bulkRestoreDrivers(@Body() body: { driverIds: number[] }) {
    return this.driversService.bulkRestore(body.driverIds);
  }

  // === Attachments ===

  @RequirePermission(PermissionModule.DRIVERS, 'read')
  @Get(':id/attachments')
  @ApiOperation({ summary: "List a driver's attachments" })
  listAttachments(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findForDriver(id);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'update')
  @Post('admin/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment for a driver' })
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
    await this.driversService.findOne(id);
    return this.attachmentsService.uploadForDriver(id, label.trim(), file);
  }

  @RequirePermission(PermissionModule.DRIVERS, 'update')
  @Delete('admin/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a driver attachment' })
  deleteAttachment(@Param('attachmentId', ParseIntPipe) attachmentId: number) {
    return this.attachmentsService.remove(attachmentId);
  }
}
