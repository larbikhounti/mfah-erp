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
import { CreateClientInvoiceDto } from '../dtos/create-client-invoice.dto';
import { UpdateClientInvoiceDto } from '../dtos/update-client-invoice.dto';
import { UpdatePaymentDto } from '../dtos/update-payment.dto';
import { BulkDeleteClientInvoicesDto } from '../dtos/bulk-delete-client-invoices.dto';
import { FilterClientInvoicesDto } from '../dtos/filter-client-invoices.dto';
import { ClientInvoicesService } from '../services/client-invoices.service';
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

@ApiTags('client-invoices')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'client-invoices',
  version: '1',
})
export class ClientInvoicesController {
  constructor(
    private clientInvoicesService: ClientInvoicesService,
    private attachmentsService: AttachmentsService,
  ) {}

  @Get()
  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'read')
  @ApiOperation({ summary: 'Get all client invoices with filtering' })
  getAllClientInvoices(@Query() filterParams: FilterClientInvoicesDto) {
    return this.clientInvoicesService.findAll(filterParams);
  }

  @Get(':id')
  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'read')
  @ApiOperation({ summary: 'Get client invoice by ID' })
  @ApiResponse({ status: 404, description: 'Client invoice not found' })
  getClientInvoiceById(@Param('id', ParseIntPipe) id: number) {
    return this.clientInvoicesService.findOne(id);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'create')
  @Post('admin/create')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Manually create a client invoice for a mission (for missions where autoInvoice was not checked). ' +
      'amount/currency/client are taken from the mission itself.',
  })
  @ApiResponse({
    status: 409,
    description: 'Mission already has a client invoice',
  })
  createClientInvoice(@Body() dto: CreateClientInvoiceDto) {
    return this.clientInvoicesService.create(dto);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'update')
  @Put('admin/:id')
  @ApiOperation({ summary: 'Update client invoice dates by ID' })
  updateClientInvoice(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateClientInvoiceDto,
  ) {
    return this.clientInvoicesService.update(id, dto);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'update')
  @Patch('admin/:id/payment')
  @ApiOperation({
    summary: 'Record a payment amount; status is recomputed automatically',
  })
  updatePayment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePaymentDto,
  ) {
    return this.clientInvoicesService.updatePayment(id, dto);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'delete')
  @Delete('admin/bulk')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Bulk delete client invoices by IDs' })
  bulkDeleteClientInvoices(@Body() dto: BulkDeleteClientInvoicesDto) {
    return this.clientInvoicesService.bulkDelete(dto);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'delete')
  @Delete('admin/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete client invoice by ID' })
  deleteClientInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.clientInvoicesService.remove(id);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'update')
  @Patch('admin/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore deleted client invoice' })
  restoreClientInvoice(@Param('id', ParseIntPipe) id: number) {
    return this.clientInvoicesService.restore(id);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'update')
  @Post('admin/bulk-restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore multiple client invoices' })
  bulkRestoreClientInvoices(@Body() body: { clientInvoiceIds: number[] }) {
    return this.clientInvoicesService.bulkRestore(body.clientInvoiceIds);
  }

  // === Attachments (the invoice PDF sent to the client, or supporting
  // docs — uploaded manually, labeled by whoever uploads it) ===

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'read')
  @Get(':id/attachments')
  @ApiOperation({ summary: "List a client invoice's attachments" })
  listAttachments(@Param('id', ParseIntPipe) id: number) {
    return this.attachmentsService.findForClientInvoice(id);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'update')
  @Post('admin/:id/attachments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload an attachment for a client invoice' })
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
    await this.clientInvoicesService.findOne(id);
    return this.attachmentsService.uploadForClientInvoice(
      id,
      label.trim(),
      file,
    );
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'update')
  @Delete('admin/attachments/:attachmentId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a client invoice attachment' })
  deleteAttachment(@Param('attachmentId', ParseIntPipe) attachmentId: number) {
    return this.attachmentsService.remove(attachmentId);
  }
}
