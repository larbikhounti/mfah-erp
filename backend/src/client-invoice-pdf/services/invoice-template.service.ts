import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';
import { promises as fs } from 'fs';
import { join } from 'path';
import { LocalFileStorageService } from '../../attachments/services/local-file-storage.service';

const ACTIVE_TEMPLATE_PATH = 'settings/invoice-template.xlsx';
const PREVIOUS_TEMPLATE_PATH = 'settings/invoice-template.previous.xlsx';

/**
 * Owns the single, system-wide "FACTURE model.xlsx" invoice template —
 * lives at a fixed path under UPLOADS_DIR (settings/invoice-template.xlsx)
 * so replacing it (e.g. to update the logo) never changes the path
 * ClientInvoicePdfService reads from. Seeded on first use from the
 * bundled factory default checked into the repo (backend/templates/), so
 * a fresh environment works without anyone uploading anything first.
 */
@Injectable()
export class InvoiceTemplateService {
  private readonly logger = new Logger(InvoiceTemplateService.name);
  private readonly defaultTemplatePath: string;
  private seeded = false;

  constructor(
    private readonly storage: LocalFileStorageService,
    private readonly configService: ConfigService,
  ) {
    this.defaultTemplatePath =
      this.configService.get<string>('INVOICE_TEMPLATE_DEFAULT_PATH') ??
      join(process.cwd(), 'templates', 'invoice-template-default.xlsx');
  }

  /** Absolute path to the currently-active template, seeding it from the
   *  bundled default the first time nothing's been uploaded yet. */
  async getActiveTemplatePath(): Promise<string> {
    await this.ensureSeeded();
    return this.storage.resolveAbsolutePath(ACTIVE_TEMPLATE_PATH);
  }

  async getActiveTemplateBuffer(): Promise<Buffer> {
    await this.ensureSeeded();
    return this.storage.read(ACTIVE_TEMPLATE_PATH);
  }

  /** Validates the upload is a real xlsx workbook, keeps a single rolling
   *  backup of whatever was active, then replaces it. */
  async replaceActiveTemplate(buffer: Buffer): Promise<void> {
    const probe = new ExcelJS.Workbook();
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- exceljs's Buffer typing doesn't match this project's @types/node
      await probe.xlsx.load(buffer as any);
    } catch {
      throw new BadRequestException('File is not a valid .xlsx workbook');
    }
    if (probe.worksheets.length === 0) {
      throw new BadRequestException('Workbook has no sheets');
    }

    await this.ensureSeeded();
    const current = await this.storage.read(ACTIVE_TEMPLATE_PATH);
    await this.storage.saveFixed(current, PREVIOUS_TEMPLATE_PATH);
    await this.storage.saveFixed(buffer, ACTIVE_TEMPLATE_PATH);
    this.logger.log('Invoice template replaced (previous version kept as a backup)');
  }

  private async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    if (!(await this.storage.exists(ACTIVE_TEMPLATE_PATH))) {
      const defaultBuffer = await fs.readFile(this.defaultTemplatePath);
      await this.storage.saveFixed(defaultBuffer, ACTIVE_TEMPLATE_PATH);
    }
    this.seeded = true;
  }
}
