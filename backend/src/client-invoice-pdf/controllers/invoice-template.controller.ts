import {
  BadRequestException,
  Controller,
  Get,
  Post,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { AdminRoleGuard } from '../../auth/guards/admin-role.guard';
import { InvoiceTemplateService } from '../services/invoice-template.service';

/**
 * Lets an admin replace the "FACTURE model.xlsx" design (e.g. after
 * updating the logo in Excel) without a code deploy — see
 * InvoiceTemplateService for where it's actually stored. Admin-only
 * (AdminRoleGuard, not the per-module PermissionGuard other ERP
 * controllers use): this replaces the branding/design on every future
 * invoice company-wide, not a per-module CRUD action.
 */
@ApiTags('invoice-template')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard, AdminRoleGuard)
@Controller({ path: 'invoice-template', version: '1' })
export class InvoiceTemplateController {
  constructor(private readonly invoiceTemplateService: InvoiceTemplateService) {}

  @Get()
  @ApiOperation({ summary: 'Download the currently-active invoice xlsx template' })
  async download(): Promise<StreamableFile> {
    const buffer = await this.invoiceTemplateService.getActiveTemplateBuffer();
    return new StreamableFile(buffer, {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      disposition: 'attachment; filename="FACTURE model.xlsx"',
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary:
      'Replace the invoice xlsx template. Every field the PDF generator ' +
      'populates (see invoice-template-cells.ts) must stay at the same ' +
      'cell address — only the design/branding around them is meant to change.',
  })
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    await this.invoiceTemplateService.replaceActiveTemplate(file.buffer);
    return { message: 'Invoice template updated' };
  }
}
