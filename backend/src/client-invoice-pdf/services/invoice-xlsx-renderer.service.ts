import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as ExcelJS from 'exceljs';
import * as JSZip from 'jszip';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { promises as fs } from 'fs';
import * as os from 'os';
import * as path from 'path';

const execFileAsync = promisify(execFile);

// exceljs re-serializes the workbook's Print_Area defined name with the row
// number's own "$" dropped (e.g. "$A$1:$P$51" -> "$A1:$P51") — a
// long-standing exceljs bug. LibreOffice's headless converter can't parse
// that malformed reference and silently falls back to printing the sheet's
// *full* used range instead of just the print area, which lets the
// template's tiled background image bleed into the extra blank columns.
// Patched back to a fully-absolute reference directly in the saved zip,
// since exceljs's own pageSetup.printArea API produces the same bad output.
const PRINT_AREA_REF_PATTERN = /\$([A-Za-z]+)(\d+)/g;

async function fixPrintAreaReferences(xlsxPath: string): Promise<void> {
  const buffer = await fs.readFile(xlsxPath);
  const zip = await JSZip.loadAsync(buffer);
  const workbookXmlFile = zip.file('xl/workbook.xml');
  if (!workbookXmlFile) return;

  const xml = await workbookXmlFile.async('string');
  const fixed = xml.replace(
    /(<definedName name="_xlnm\.Print_Area"[^>]*>)([^<]*)(<\/definedName>)/g,
    (_match, open: string, body: string, close: string) =>
      `${open}${body.replace(PRINT_AREA_REF_PATTERN, (_m, col: string, row: string) => `$${col}$${row}`)}${close}`,
  );
  if (fixed === xml) return;

  zip.file('xl/workbook.xml', fixed);
  const patched = await zip.generateAsync({ type: 'nodebuffer' });
  await fs.writeFile(xlsxPath, patched);
}

/**
 * Generic "populate an xlsx template, render it to PDF" engine — no
 * knowledge of invoices or cell names, that's ClientInvoicePdfService's
 * job. Conversion shells out to a headless LibreOffice (`soffice`), which
 * is what actually turns the styled/merged-cell xlsx into a pixel-accurate
 * PDF (there's no pure-JS renderer that preserves this template's layout).
 */
@Injectable()
export class InvoiceXlsxRendererService {
  private readonly logger = new Logger(InvoiceXlsxRendererService.name);
  private readonly sofficeBin: string;
  // One shared LibreOffice profile, reused across calls — spinning up a
  // *fresh* `-env:UserInstallation` per request (the original approach)
  // forces soffice to reinitialize its whole config/extension registry
  // from scratch every time, which measured ~12s cold vs. ~7-8s warm on a
  // dev machine. A fresh process still launches per call (there's no
  // persistent listener here), so this doesn't make conversions fast, just
  // not-pay-full-cold-start-every-time. Calls are serialized (`queue`
  // below) since concurrent invocations against the same profile directory
  // corrupt its lock file.
  private readonly profileDir: string;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(private readonly configService: ConfigService) {
    this.sofficeBin = this.configService.get<string>('LIBREOFFICE_BIN') ?? 'soffice';
    this.profileDir =
      this.configService.get<string>('LIBREOFFICE_PROFILE_DIR') ??
      path.join(os.tmpdir(), 'mfah-invoice-pdf-profile');
  }

  async loadTemplate(templatePath: string): Promise<ExcelJS.Workbook> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    return workbook;
  }

  /** Saves the given workbook to a scratch .xlsx and converts it to PDF. */
  async convertToPdf(workbook: ExcelJS.Workbook): Promise<Buffer> {
    const run = this.queue.then(() => this.convertToPdfExclusive(workbook));
    // Swallow rejections in the queue chain itself (the caller still sees
    // them via `run`) so one failed conversion doesn't permanently wedge
    // every conversion queued after it.
    this.queue = run.catch(() => undefined);
    return run;
  }

  private async convertToPdfExclusive(workbook: ExcelJS.Workbook): Promise<Buffer> {
    const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'invoice-pdf-'));
    const xlsxPath = path.join(workDir, 'invoice.xlsx');

    try {
      await workbook.xlsx.writeFile(xlsxPath);
      await fixPrintAreaReferences(xlsxPath);
      await execFileAsync(
        this.sofficeBin,
        [
          '--headless',
          '--norestore',
          '--nolockcheck',
          `-env:UserInstallation=file://${this.profileDir}`,
          '--convert-to',
          'pdf',
          '--outdir',
          workDir,
          xlsxPath,
        ],
        { timeout: 45000 },
      );

      return await fs.readFile(path.join(workDir, 'invoice.pdf'));
    } catch (error) {
      this.logger.error('LibreOffice PDF conversion failed', error as Error);
      throw error;
    } finally {
      await fs.rm(workDir, { recursive: true, force: true }).catch(() => undefined);
    }
  }
}
