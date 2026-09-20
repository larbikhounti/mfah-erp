import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { PermissionModule } from '@prisma/client';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { PermissionGuard } from '../../auth/guards/permission.guard';
import { RequirePermission } from '../../auth/decorator/require-permission.decorator';
import { GenerateInvoicePdfDto } from '../dtos/generate-invoice-pdf.dto';
import { ClientInvoicePdfService } from '../services/client-invoice-pdf.service';
import { ClientInvoicesService } from '../../client-invoices/services/client-invoices.service';
import { AttachmentsService } from '../../attachments/services/attachments.service';

/**
 * Routes stay under `client-invoices/admin/:id/...` (same paths the old
 * in-module PDF endpoints used) so the frontend store needs no changes —
 * only which module owns them changed, to keep the xlsx-rendering pipeline
 * (and its LibreOffice/font dependency) tracked separately from the plain
 * CRUD in ClientInvoicesModule.
 */
@ApiTags('client-invoices')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({ path: 'client-invoices', version: '1' })
export class ClientInvoicePdfController {
  constructor(
    private readonly clientInvoicePdfService: ClientInvoicePdfService,
    private readonly clientInvoicesService: ClientInvoicesService,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'read')
  @Get('admin/:id/pdf-prefill')
  @ApiOperation({
    summary:
      "Suggested default values for the invoice PDF's fields, computed from " +
      'the invoice/mission/client/truck — the frontend generator dialog uses ' +
      'these to pre-fill, the user can still edit everything before generating.',
  })
  getPdfPrefill(@Param('id', ParseIntPipe) id: number) {
    return this.clientInvoicePdfService.getPrefill(id);
  }

  @RequirePermission(PermissionModule.CLIENT_INVOICES, 'update')
  @Post('admin/:id/generate-pdf')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Fills "FACTURE model.xlsx" with the given field values, saves the ' +
      'result as an attachment on this invoice, and returns it for download.',
  })
  async generatePdf(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: GenerateInvoicePdfDto,
  ): Promise<StreamableFile> {
    const invoice = await this.clientInvoicesService.findOne(id);
    const pdfBuffer = await this.clientInvoicePdfService.generate(id, dto);

    const invoiceNumberForFile = invoice.invoiceNumber.replace(/[\\/]/g, '-');
    const fileName = `Facture-${invoiceNumberForFile}.pdf`;
    await this.attachmentsService.uploadForClientInvoice(id, 'Generated Invoice', {
      buffer: pdfBuffer,
      originalname: fileName,
      mimetype: 'application/pdf',
    });

    return new StreamableFile(pdfBuffer, {
      type: 'application/pdf',
      disposition: `attachment; filename="${fileName}"`,
    });
  }
}
