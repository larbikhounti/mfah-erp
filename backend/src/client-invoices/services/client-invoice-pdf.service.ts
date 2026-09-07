import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { promises as fs } from 'fs';
import { PrismaService } from '../../prisma/prisma.service';
import { amountToFrenchWords } from '../helpers/amount-to-french-words';
import { GenerateInvoicePdfDto } from '../dtos/generate-invoice-pdf.dto';
import { InvoicePdfPrefill } from '../types/invoice-pdf-prefill.type';

const SURCHARGE_FIELD_NAMES = ['tmsa', 'immobilisation', 'double_equipage', 'gazoil'] as const;

// A few of the template's boxes are a little tight for their own default
// font size — e.g. "Export" in Operation, or a two-line Designation — and
// clip. Grown downward only (never upward, which would eat into each row's
// own black header label bar sitting directly above it) since the row
// below is either blank margin or the TMSA section, which we white out
// anyway when it's not shown — verified visually that this doesn't clip
// the TMSA header when that row *is* shown.
const FIELD_HEIGHT_INCREASES: Record<string, number> = {
  matricule: 4,
  remorque: 4,
  operation: 4,
  cmr: 4,
  commande: 4,
  designation: 8,
};

// The template's own default sizes (10-11pt) read a little large once
// everything's filled in — one notch smaller across the board looks
// tighter and more like a normal invoice line.
const FIELD_FONT_SIZE = 9;

function formatDateFr(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}/${date.getFullYear()}`;
}

/**
 * Fills facture_template_editable.pdf's AcroForm fields via pdf-lib — the
 * only place in the codebase that touches the invoice PDF template. Field
 * names in GenerateInvoicePdfDto match the PDF's own field names exactly
 * (see the template's AcroForm), so `generate()` is a plain pass-through:
 * all business logic about what's on the invoice lives in the frontend's
 * "Generate PDF" dialog, not here.
 */
@Injectable()
export class ClientInvoicePdfService {
  private readonly logger = new Logger(ClientInvoicePdfService.name);
  private readonly templatePath: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {
    this.templatePath =
      this.configService.get<string>('INVOICE_PDF_TEMPLATE_PATH') ??
      './facture_template_editable.pdf';
  }

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

    // The template's "DH" labels are baked into its graphic design, not
    // form fields — there's no clean way to swap them for "€" per invoice.
    // For a EUR invoice we instead spell the currency out in the amount
    // itself, so the number is unambiguous even sitting next to a "DH".
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

    const templateBytes = await fs.readFile(this.templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const form = pdfDoc.getForm();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // invoice_number always comes from the DB record itself — never from
    // the request — so it can't drift from what the system actually
    // tracks under that number.
    const allFields: Record<string, string | undefined> = {
      ...fields,
      invoice_number: invoice.invoiceNumber,
    };

    for (const [name, increase] of Object.entries(FIELD_HEIGHT_INCREASES)) {
      const widget = form.getTextField(name).acroField.getWidgets()[0];
      const rect = widget.getRectangle();
      widget.setRectangle({ x: rect.x, y: rect.y - increase, width: rect.width, height: rect.height + increase });
    }

    // The template ships with a light highlight color baked into every
    // field's own appearance — pdf-lib only regenerates a field's
    // appearance (picking up a new background) when it actually sets text
    // on it, so an untouched field keeps that highlight even after
    // flatten(). Force every field through setText (blank if we have
    // nothing for it) with a white background so the whole form comes out
    // plain white, filled or not.
    for (const field of form.getFields()) {
      const name = field.getName();
      for (const widget of field.acroField.getWidgets()) {
        widget.getOrCreateAppearanceCharacteristics().setBackgroundColor([1, 1, 1]);
      }
      try {
        const textField = form.getTextField(name);
        // Not textField.setFontSize(): the template's own /DA strings are
        // malformed (a literal "\057Helv..." instead of "/Helv..."), which
        // makes its regex-based Tf lookup throw for every field. Writing a
        // fresh, well-formed DA sidesteps that parsing entirely.
        textField.acroField.setDefaultAppearance(`/Helv ${FIELD_FONT_SIZE} Tf 0 0 0 rg`);
        textField.setText(allFields[name] ? String(allFields[name]) : '');
      } catch {
        this.logger.warn(`Unknown invoice PDF field "${name}" — skipped`);
      }
    }

    // The TMSA/immobilisation/Double Équipage/Gazoil row (header bar +
    // inputs) is only relevant when at least one of those was actually
    // filled in — capture its on-page geometry now, before flatten()
    // removes the AcroForm fields, so we can white it out afterward if none
    // of them apply to this invoice.
    const hasAnySurcharge = SURCHARGE_FIELD_NAMES.some((name) => allFields[name]);
    let surchargeSectionRect: { x: number; y: number; width: number; height: number } | null = null;
    if (!hasAnySurcharge) {
      const rowRects = [...SURCHARGE_FIELD_NAMES, 'extras_total'].map((name) =>
        form.getTextField(name).acroField.getWidgets()[0].getRectangle(),
      );
      // The row's header label bar sits directly above its inputs, up to
      // the bottom edge of the row above it (Matricule/Remorque/...).
      const rowAboveBottom = form.getTextField('matricule').acroField.getWidgets()[0].getRectangle().y;
      // A couple points of padding on every edge — the header bar's own
      // background shape extends a hair past the widget rectangles
      // themselves, which otherwise leaves a thin sliver of it showing.
      const padding = 3;
      const left = Math.min(...rowRects.map((r) => r.x)) - padding;
      const right = Math.max(...rowRects.map((r) => r.x + r.width)) + padding;
      const bottom = Math.min(...rowRects.map((r) => r.y)) - padding;
      const top = rowAboveBottom + padding;
      surchargeSectionRect = { x: left, y: bottom, width: right - left, height: top - bottom };
    }

    // Bake the values in with a standard font (handles accented French
    // characters reliably) then flatten — this is a finished invoice, not
    // something the recipient should be able to edit further.
    form.updateFieldAppearances(font);
    form.flatten();

    if (surchargeSectionRect) {
      pdfDoc.getPage(0).drawRectangle({ ...surchargeSectionRect, color: rgb(1, 1, 1) });
    }

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
