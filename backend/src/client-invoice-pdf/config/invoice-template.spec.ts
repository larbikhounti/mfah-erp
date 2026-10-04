import * as ExcelJS from 'exceljs';
import { join } from 'path';
import {
  EXCHANGE_RATE_FIELD_NAMES,
  EXCHANGE_RATE_ROWS,
  INVOICE_TEMPLATE_CELLS,
  SURCHARGE_FIELD_NAMES,
  SURCHARGE_ROWS,
} from './invoice-template-cells';
import { GenerateInvoicePdfDto } from '../dtos/generate-invoice-pdf.dto';

/**
 * Guards the bundled factory-default template (the one prod is reset to)
 * against edits in Excel that silently break the cell mapping: a merged
 * range moved, a static "DH" label put back, a row renumbered, etc.
 */
const DEFAULT_TEMPLATE = join(
  __dirname,
  '../../../templates/invoice-template-default.xlsx',
);

const rowOf = (ref: string) => Number(ref.replace(/^[A-Z]+/, ''));

describe('invoice template (templates/invoice-template-default.xlsx)', () => {
  let sheet: ExcelJS.Worksheet;
  let merges: string[];

  beforeAll(async () => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(DEFAULT_TEMPLATE);
    sheet = workbook.worksheets[0];
    merges = (sheet.model as unknown as { merges: string[] }).merges;
  });

  it('has exactly one sheet with a print area', () => {
    expect(sheet).toBeDefined();
    expect(sheet.pageSetup.printArea).toBeTruthy();
  });

  it('labels the 4th surcharge column "Transitaire"', () => {
    expect(sheet.getCell('I19').value).toBe('Transitaire');
  });

  it.each(Object.entries(INVOICE_TEMPLATE_CELLS))(
    'maps %s to %s, the top-left cell of a merged range (or a plain cell)',
    (_field, ref) => {
      const containing = merges.find((range) => {
        const [start, end] = range.split(':');
        const [s, e] = [sheet.getCell(start), sheet.getCell(end)];
        const c = sheet.getCell(ref);
        return (
          +c.row >= +s.row &&
          +c.row <= +e.row &&
          +c.col >= +s.col &&
          +c.col <= +e.col
        );
      });
      if (containing) {
        expect(containing.split(':')[0]).toBe(ref);
      } else {
        expect(sheet.getCell(ref).isMerged).toBe(false);
      }
    },
  );

  it('maps every field to its own cell', () => {
    const refs = Object.values(INVOICE_TEMPLATE_CELLS);
    expect(new Set(refs).size).toBe(refs.length);
  });

  it('only maps fields the generate-pdf request actually accepts', () => {
    // invoice_number comes from the database, not the request.
    const mapped = Object.keys(INVOICE_TEMPLATE_CELLS).filter(
      (f) => f !== 'invoice_number',
    );
    // The DTO's declared fields, read from the @ApiProperty metadata Nest
    // keeps on it (every field there is also class-validator decorated).
    const accepted: string[] = (
      Reflect.getMetadata(
        'swagger/apiModelPropertiesArray',
        GenerateInvoicePdfDto.prototype,
      ) ?? []
    ).map((p: string) => p.replace(/^:/, ''));

    expect(accepted.length).toBeGreaterThan(0);
    for (const field of mapped) expect(accepted).toContain(field);
  });

  it('has no static "DH"/"MAD"/"EUR" labels left — the unit is part of each amount', () => {
    const labels: string[] = [];
    sheet.eachRow((row) =>
      row.eachCell((c) => {
        const text = typeof c.value === 'string' ? c.value.trim() : '';
        if (['DH', 'MAD', 'EUR', '€'].includes(text))
          labels.push(`${c.address}=${text}`);
      }),
    );
    expect(labels).toEqual([]);
  });

  it('keeps the surcharge fields on the rows that get hidden', () => {
    for (const field of SURCHARGE_FIELD_NAMES) {
      expect(SURCHARGE_ROWS).toContain(rowOf(INVOICE_TEMPLATE_CELLS[field]));
    }
  });

  it('keeps the exchange-rate fields on the row that gets hidden, and nothing else there', () => {
    for (const field of EXCHANGE_RATE_FIELD_NAMES) {
      expect(EXCHANGE_RATE_ROWS).toContain(
        rowOf(INVOICE_TEMPLATE_CELLS[field]),
      );
    }
    const others = Object.entries(INVOICE_TEMPLATE_CELLS).filter(
      ([field, ref]) =>
        EXCHANGE_RATE_ROWS.includes(rowOf(ref)) &&
        !(EXCHANGE_RATE_FIELD_NAMES as readonly string[]).includes(field),
    );
    expect(others).toEqual([]);
  });
});
