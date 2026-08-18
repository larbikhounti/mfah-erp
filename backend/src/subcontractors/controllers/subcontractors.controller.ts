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
import { CreateSubcontractorDto } from '../dtos/create-subcontractor.dto';
import { UpdateSubcontractorDto } from '../dtos/update-subcontractor.dto';
import { BulkDeleteSubcontractorsDto } from '../dtos/bulk-delete-subcontractors.dto';
import { FilterSubcontractorsDto } from '../dtos/filter-subcontractors.dto';
import { SubcontractorsService } from '../services/subcontractors.service';
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

@ApiTags('subcontractors')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'subcontractors',
  version: '1',
})
export class SubcontractorsController {
  constructor(
    private subcontractorsService: SubcontractorsService,
    private attachmentsService: AttachmentsService,
  ) {}

  @Get()
  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'read')
  @ApiOperation({ summary: 'Get all subcontractors with filtering' })
  getAllSubcontractors(@Query() filterParams: FilterSubcontractorsDto) {
    return this.subcontractorsService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'read')
  @ApiOperation({ summary: 'Get subcontractor by ID' })
  @ApiResponse({ status: 404, description: 'Subcontractor not found' })
  getSubcontractorById(@Param('id', ParseIntPipe) id: number) {
    return this.subcontractorsService.findOne(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new subcontractor' })
  @ApiResponse({
    status: 409,
    description: 'Subcontractor with this ICE already exists',
  })
  createSubcontractor(@Body() dto: CreateSubcontractorDto) {
    return this.subcontractorsService.create(dto);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update subcontractor by ID' })
  updateSubcontractor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubcontractorDto,
  ) {
    return this.subcontractorsService.update(id, dto);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete subcontractors by IDs' })
  bulkDeleteSubcontractors(@Body() dto: BulkDeleteSubcontractorsDto) {
    return this.subcontractorsService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete subcontractor by ID' })
  deleteSubcontractor(@Param('id', ParseIntPipe) id: number) {
    return this.subcontractorsService.remove(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted subcontractor' })
  restoreSubcontractor(@Param('id', ParseIntPipe) id: number) {
    return this.subcontractorsService.restore(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple subcontractors' })
  bulkRestoreSubcontractors(@Body() body: { subcontractorIds: number[] }) {
    return this.subcontractorsService.bulkRestore(body.subcontractorIds);
  }

  // === Attachments ===

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'read')
  @Get(':id/attachments')
  @ApiOperation({ summary: "List a subcontractor's attachments" })
  listAttachments(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findForSubcontractor(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'update')
  @Post('admin/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment for a subcontractor' })
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
    await this.subcontractorsService.findOne(id);
    return this.attachmentsService.uploadForSubcontractor(
      id,
      label.trim(),
      file,
    );
  }

  @RequirePermission(PermissionModule.SUBCONTRACTORS, 'update')
  @Delete('admin/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a subcontractor attachment' })
  deleteAttachment(@Param('attachmentId', ParseIntPipe) attachmentId: number) {
    return this.attachmentsService.remove(attachmentId);
  }
}
