import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { amountToFrenchWords } from '../helpers/amount-to-french-words';
import { GenerateInvoicePdfDto } from '../dtos/generate-invoice-pdf.dto';
import { InvoicePdfPrefill } from '../types/invoice-pdf-prefill.type';
import { InvoiceXlsxRendererService } from './invoice-xlsx-renderer.service';
import { InvoiceTemplateService } from './invoice-template.service';
import {
  INVOICE_TEMPLATE_CELLS,
  SURCHARGE_FIELD_NAMES,
  SURCHARGE_ROWS,
} from '../config/invoice-template-cells';

function formatDateFr(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

/**
 * Fills "FACTURE model.xlsx" via ClientInvoiceXlsxRendererService and
 * returns the rendered PDF. Same contract as the PDF-form-filling version
 * it replaces: this is a pure pass-through — every value that ends up on
 * the page comes from `fields` (the frontend's "Generate PDF" dialog is
 * the one source of truth), this only maps DTO keys to template cells via
 * INVOICE_TEMPLATE_CELLS. No totals/derived values are computed here.
 */
@Injectable()
export class ClientInvoicePdfService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly renderer: InvoiceXlsxRendererService,
    private readonly templateService: InvoiceTemplateService,
  ) {}

  /** Suggested default values, computed from the invoice/mission/client/truck. */
  async getPrefill(id: number): Promise<InvoicePdfPrefill> {
    const invoice = await this.prisma.clientInvoice.findUnique({
      where: { id },
      include: { client: true, mission: { include: { truck: true } } },
    });

    if (!invoice) {
      throw new NotFoundException('Client invoice not found');
    }

    const amount = Number(invoice.amount);
    // TVA is a manual figure staff confirm per invoice — this is only a
    // starting suggestion at the standard 10% rate shown on the template.
    const tva = Math.round(amount * 0.1 * 100) / 100;
    const totalTtc = Math.round((amount + tva) * 100) / 100;

    // The template's "DH" labels are baked into its design, not data cells
    // — there's no clean way to swap them for "€" per invoice. For a EUR
    // invoice we instead spell the currency out in the amount itself, so
    // the number is unambiguous even sitting next to a "DH".
    const money = (value: number) =>
      invoice.currency === 'EUR' ? `${value.toFixed(2)} EUR` : value.toFixed(2);

    return {
      client_name: invoice.client.companyName,
      client_ice: invoice.client.ice,
      invoice_number: invoice.invoiceNumber,
      invoice_date: formatDateFr(invoice.issueDate),
      // We only track one `missionDate`, not separate loading/delivery
      // dates — both default to it and staff can correct either.
      loading_date: formatDateFr(invoice.mission.missionDate),
      delivery_date: formatDateFr(invoice.mission.missionDate),
      matricule: invoice.mission.truck?.plateNumber ?? '',
      operation: invoice.mission.transportType === 'EXPORT' ? 'Export' : 'Import',
      designation: `Transport international de ${invoice.mission.loadingLocation} à ${invoice.mission.deliveryLocation}`,
      quantity: '1',
      unit_price: money(amount),
      line_total: money(amount),
      total_ht: money(amount),
      tva: money(tva),
      total_ttc: money(totalTtc),
      amount_in_words: amountToFrenchWords(totalTtc, invoice.currency),
      hasTruck: !!invoice.mission.truckId,
      currency: invoice.currency,
    };
  }

  /** Fills the template with whatever fields are given and returns the PDF bytes. */
  async generate(id: number, fields: GenerateInvoicePdfDto): Promise<Buffer> {
    const invoice = await this.prisma.clientInvoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Client invoice not found');
    }

    // Resolved fresh on every call (not cached) so an admin's template
    // re-upload (see InvoiceTemplateController) takes effect immediately.
    const templatePath = await this.templateService.getActiveTemplatePath();
    const workbook = await this.renderer.loadTemplate(templatePath);
    const sheet = workbook.worksheets[0];

    // invoice_number always comes from the DB record itself — never from
    // the request — so it can't drift from what the system actually
    // tracks under that number.
    const allFields: Record<string, string | undefined> = {
      ...fields,
      invoice_number: invoice.invoiceNumber,
    };

    for (const [name, cellRef] of Object.entries(INVOICE_TEMPLATE_CELLS)) {
      sheet.getCell(cellRef).value = allFields[name] ?? '';
    }

    // The TMSA/Immobilisation/Double Équipage/Transitair row only makes
    // sense when at least one of those was actually filled in — hide both
    // its header and value rows entirely when none apply, same intent as
    // the old PDF template's manual whiteout of that section.
    const hasAnySurcharge = SURCHARGE_FIELD_NAMES.some((name) => allFields[name]);
    if (!hasAnySurcharge) {
      for (const rowNumber of SURCHARGE_ROWS) {
        sheet.getRow(rowNumber).hidden = true;
      }
    }

    return this.renderer.convertToPdf(workbook);
  }
}
