import { ConfigService } from '@nestjs/config';
import { execFileSync } from 'child_process';
import { join } from 'path';
import { InvoiceXlsxRendererService } from './invoice-xlsx-renderer.service';
import {
  EXCHANGE_RATE_ROWS,
  INVOICE_TEMPLATE_CELLS,
  SURCHARGE_ROWS,
} from '../config/invoice-template-cells';

/**
 * Renders real invoices through LibreOffice and checks they fit on ONE
 * page. Long amounts once spilled onto a second page on the Linux server
 * (see CLAUDE.md) — this is the check that catches that. Needs
 * LibreOffice (`soffice`, or LIBREOFFICE_BIN) and the Neo Sans fonts
 * installed; skipped with a warning when LibreOffice isn't found.
 */
const DEFAULT_TEMPLATE = join(
  __dirname,
  '../../../templates/invoice-template-default.xlsx',
);
const SOFFICE = process.env.LIBREOFFICE_BIN ?? 'soffice';

const hasLibreOffice = (() => {
  try {
    execFileSync(SOFFICE, ['--version'], { stdio: 'ignore', timeout: 30000 });
    return true;
  } catch {
    return false;
  }
})();

if (!hasLibreOffice) {
  console.warn(`[invoice render tests] skipped: "${SOFFICE}" not found`);
}

/** Counts pages in a PDF by its /Type /Page objects (not /Pages). */
const pageCount = (pdf: Buffer) =>
  (pdf.toString('latin1').match(/\/Type\s*\/Page(?!s)/g) ?? []).length;

// Worst case for width: big amounts with the longest unit suffix, long
// address, every optional field filled.
const worstCase = (unit: 'DH' | 'EUR') => ({
  client_name: 'SOCIETE INTERNATIONALE DE TRANSPORT SARL',
  client_address:
    '21 Rue Ibn Battouta, Zone Franche Gzenaya, Lot 45, Tanger 90000',
  invoice_number: 'INV-2026-000021',
  invoice_date: '22/09/2026',
  loading_date: '13/09/2026',
  delivery_date: '22/09/2026',
  client_ice: '003770120000015',
  matricule: '12345-A-67',
  remorque: 'REM-998877',
  operation: 'Import',
  cmr: 'CMR-2026-00123',
  commande: 'PO-99887766',
  designation: 'Transport international de Alicante à Tanger',
  quantity: '1',
  unit_price: `1888000.00 ${unit}`,
  line_total: `1888000.00 ${unit}`,
  total_ht: `1899500.00 ${unit}`,
  tva: `189950.00 ${unit}`,
  total_ttc: `2089450.00 ${unit}`,
  amount_in_words:
    'Deux millions quatre-vingt-neuf mille quatre cent cinquante euros et 00 centimes.',
  tmsa: '3000.00',
  immobilisation: '4500.00',
  double_equipage: '2500.00',
  transitaire: '1500.00',
  extras_total: `11500.00 ${unit}`,
});

(hasLibreOffice ? describe : describe.skip)(
  'InvoiceXlsxRendererService (real LibreOffice render)',
  () => {
    jest.setTimeout(120000);

    const renderer = new InvoiceXlsxRendererService({
      get: () => undefined,
    } as unknown as ConfigService);

    const render = async (
      fields: Record<string, string>,
      hideRows: number[],
    ) => {
      const workbook = await renderer.loadTemplate(DEFAULT_TEMPLATE);
      const sheet = workbook.worksheets[0];
      for (const [field, ref] of Object.entries(INVOICE_TEMPLATE_CELLS)) {
        sheet.getCell(ref).value = fields[field] ?? '';
      }
      for (const row of hideRows) sheet.getRow(row).hidden = true;
      return renderer.convertToPdf(workbook);
    };

    it('renders a MAD invoice (no surcharges, no rate) on one page', async () => {
      const pdf = await render(worstCase('DH'), [
        ...SURCHARGE_ROWS,
        ...EXCHANGE_RATE_ROWS,
      ]);
      expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
      expect(pageCount(pdf)).toBe(1);
    });

    it('renders a EUR invoice with surcharges and exchange rate on one page', async () => {
      const pdf = await render(
        {
          ...worstCase('EUR'),
          exchange_rate_line:
            'Taux de change EUR/MAD au 22/09/2026 : 1 EUR = 10,9375 MAD',
          total_ttc_mad: '22853359.38 DH',
        },
        [],
      );
      expect(pageCount(pdf)).toBe(1);
    });
  },
);
