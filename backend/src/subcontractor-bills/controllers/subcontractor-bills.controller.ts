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
import { CreateSubcontractorBillDto } from '../dtos/create-subcontractor-bill.dto';
import { UpdateSubcontractorBillDto } from '../dtos/update-subcontractor-bill.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { BulkDeleteSubcontractorBillsDto } from '../dtos/bulk-delete-subcontractor-bills.dto';
import { FilterSubcontractorBillsDto } from '../dtos/filter-subcontractor-bills.dto';
import { SubcontractorBillsService } from '../services/subcontractor-bills.service';
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

// This entire module is internal-only by nature (it exists because
// PermissionGuard governs it — no client-facing surface reaches it at all,
// see the visibility-boundary requirement behind keeping this model
// separate from ClientInvoice).
@ApiTags('subcontractor-bills')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'subcontractor-bills',
  version: '1',
})
export class SubcontractorBillsController {
  constructor(
    private subcontractorBillsService: SubcontractorBillsService,
    private attachmentsService: AttachmentsService,
  ) {}

  @Get()
  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'read')
  @ApiOperation({ summary: 'Get all subcontractor bills with filtering' })
  getAllSubcontractorBills(@Query() filterParams: FilterSubcontractorBillsDto) {
    return this.subcontractorBillsService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'read')
  @ApiOperation({ summary: 'Get subcontractor bill by ID' })
  @ApiResponse({ status: 404, description: 'Subcontractor bill not found' })
  getSubcontractorBillById(@Param('id', ParseIntPipe) id: number) {
    return this.subcontractorBillsService.findOne(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      "Manually record a subcontractor's bill for a SUBCONTRACTED mission (triggered by " +
      'actually receiving their PDF bill). amount/currency/subcontractor are taken from the mission.',
  })
  @ApiResponse({
    status: 400,
    description: 'Mission is not SUBCONTRACTED, or has no subcontractor cost',
  })
  @ApiResponse({
    status: 409,
    description: 'Mission already has a subcontractor bill',
  })
  createSubcontractorBill(@Body() dto: CreateSubcontractorBillDto) {
    return this.subcontractorBillsService.create(dto);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update subcontractor bill dates by ID' })
  updateSubcontractorBill(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubcontractorBillDto,
  ) {
    return this.subcontractorBillsService.update(id, dto);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'update')
  @Patch('admin/:id/payment')
  @ApiOperation({
    summary: 'Record a payment amount; status is recomputed automatically',
  })
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.subcontractorBillsService.updatePayment(id, dto);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete subcontractor bills by IDs' })
  bulkDeleteSubcontractorBills(@Body() dto: BulkDeleteSubcontractorBillsDto) {
    return this.subcontractorBillsService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete subcontractor bill by ID' })
  deleteSubcontractorBill(@Param('id', ParseIntPipe) id: number) {
    return this.subcontractorBillsService.remove(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted subcontractor bill' })
  restoreSubcontractorBill(@Param('id', ParseIntPipe) id: number) {
    return this.subcontractorBillsService.restore(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple subcontractor bills' })
  bulkRestoreSubcontractorBills(
    @Body() body: { subcontractorBillIds: number[] },
  ) {
    return this.subcontractorBillsService.bulkRestore(
      body.subcontractorBillIds,
    );
  }

  // === Attachments (the bill PDF received from the subcontractor, or
  // supporting docs — uploaded manually, labeled by whoever uploads it) ===

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'read')
  @Get(':id/attachments')
  @ApiOperation({ summary: "List a subcontractor bill's attachments" })
  listAttachments(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findForSubcontractorBill(id);
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'update')
  @Post('admin/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment for a subcontractor bill' })
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
    await this.subcontractorBillsService.findOne(id);
    return this.attachmentsService.uploadForSubcontractorBill(
      id,
      label.trim(),
      file,
    );
  }

  @RequirePermission(PermissionModule.SUBCONTRACTOR_BILLS, 'update')
  @Delete('admin/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a subcontractor bill attachment' })
  deleteAttachment(@Param('attachmentId', ParseIntPipe) attachmentId: number) {
    return this.attachmentsService.remove(attachmentId);
  }
}
