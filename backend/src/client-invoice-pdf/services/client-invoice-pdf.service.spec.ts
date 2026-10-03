import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Currency, Prisma, TransportType } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import { join } from 'path';
import { ClientInvoicePdfService } from './client-invoice-pdf.service';
import { InvoiceXlsxRendererService } from './invoice-xlsx-renderer.service';
import { InvoiceTemplateService } from './invoice-template.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  EXCHANGE_RATE_ROWS,
  INVOICE_TEMPLATE_CELLS,
  SURCHARGE_ROWS,
} from '../config/invoice-template-cells';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const DEFAULT_TEMPLATE = join(
  __dirname,
  '../../../templates/invoice-template-default.xlsx',
);

const invoiceRow = (
  overrides: {
    currency?: Currency;
    exchangeRate?: number | null;
    address?: string | null;
  } = {},
) => ({
  id: 1,
  invoiceNumber: 'INV-2026-000021',
  amount: new Prisma.Decimal(18000),
  currency: overrides.currency ?? Currency.MAD,
  issueDate: new Date(2026, 8, 22),
  client: {
    companyName: 'FIBRA VIVA SARL',
    ice: '003770120000015',
    address:
      overrides.address === undefined
        ? '21 Rue Ibn Battouta, Tanger'
        : overrides.address,
  },
  mission: {
    missionDate: new Date(2026, 8, 13),
    transportType: TransportType.IMPORT,
    loadingLocation: 'Alicante',
    deliveryLocation: 'Tanger',
    truckId: 10,
    truck: { plateNumber: '12345-A-67' },
    exchangeRate:
      overrides.exchangeRate === undefined || overrides.exchangeRate === null
        ? null
        : new Prisma.Decimal(overrides.exchangeRate),
  },
});

describe('ClientInvoicePdfService', () => {
  let service: ClientInvoicePdfService;
  let prisma: PrismaMock;
  /** The workbook handed to LibreOffice on the last generate() call. */
  let rendered: ExcelJS.Workbook;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const renderer = {
      loadTemplate: async (path: string) => {
        const wb = new ExcelJS.Workbook();
        await wb.xlsx.readFile(path);
        return wb;
      },
      convertToPdf: jest.fn((wb: ExcelJS.Workbook) => {
        rendered = wb;
        return Promise.resolve(Buffer.from('%PDF-fake'));
      }),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientInvoicePdfService,
        { provide: PrismaService, useValue: prisma },
        { provide: InvoiceXlsxRendererService, useValue: renderer },
        {
          provide: InvoiceTemplateService,
          useValue: {
            getActiveTemplatePath: () => Promise.resolve(DEFAULT_TEMPLATE),
          },
        },
      ],
    }).compile();
    service = moduleRef.get(ClientInvoicePdfService);
  });

  describe('getPrefill', () => {
    it('suffixes every amount with DH on a MAD invoice', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(invoiceRow());
      const prefill = await service.getPrefill(1);

      expect(prefill).toMatchObject({
        unit_price: '18000.00 DH',
        line_total: '18000.00 DH',
        total_ht: '18000.00 DH',
        tva: '1800.00 DH',
        total_ttc: '19800.00 DH',
        amount_in_words: 'Dix-neuf mille huit cents dirhams et 00 centimes.',
        currency: Currency.MAD,
      });
    });

    it('suffixes every amount with EUR on a EUR invoice', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(
        invoiceRow({ currency: Currency.EUR }),
      );
      const prefill = await service.getPrefill(1);

      expect(prefill.total_ttc).toBe('19800.00 EUR');
      expect(prefill.tva).toBe('1800.00 EUR');
      expect(prefill.amount_in_words).toContain('euros');
    });

    it('fills client, dates, truck and route from the invoice/mission', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(invoiceRow());
      const prefill = await service.getPrefill(1);

      expect(prefill).toMatchObject({
        client_name: 'FIBRA VIVA SARL',
        client_address: '21 Rue Ibn Battouta, Tanger',
        client_ice: '003770120000015',
        invoice_number: 'INV-2026-000021',
        invoice_date: '22/09/2026',
        loading_date: '13/09/2026',
        delivery_date: '13/09/2026',
        matricule: '12345-A-67',
        operation: 'Import',
        designation: 'Transport international de Alicante à Tanger',
        hasTruck: true,
      });
    });

    it('leaves the address empty when the client has none', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(
        invoiceRow({ address: null }),
      );
      expect((await service.getPrefill(1)).client_address).toBe('');
    });

    it("passes the mission's exchange rate through on a EUR invoice", async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(
        invoiceRow({ currency: Currency.EUR, exchangeRate: 10.93 }),
      );
      const prefill = await service.getPrefill(1);

      expect(prefill.exchange_rate).toBe('10.93');
      expect(prefill.exchange_rate_date).toBe('13/09/2026');
    });

    it('never offers an exchange rate on a MAD invoice', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(
        invoiceRow({ currency: Currency.MAD, exchangeRate: 10.93 }),
      );
      expect((await service.getPrefill(1)).exchange_rate).toBe('');
    });

    it('404s for an unknown invoice', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(null);
      await expect(service.getPrefill(1)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('generate', () => {
    const cell = (field: string) =>
      rendered.worksheets[0].getCell(INVOICE_TEMPLATE_CELLS[field]).value;
    const rowHidden = (row: number) =>
      rendered.worksheets[0].getRow(row).hidden;

    beforeEach(() => {
      prisma.clientInvoice.findUnique.mockResolvedValue({
        id: 1,
        invoiceNumber: 'INV-2026-000021',
      });
    });

    it('writes each field verbatim into its mapped cell', async () => {
      await service.generate(1, {
        client_name: 'ACME',
        client_address: 'Tanger',
        total_ttc: '19800.00 DH',
        designation: 'Transport international de Alicante à Tanger',
      });

      expect(cell('client_name')).toBe('ACME');
      expect(cell('client_address')).toBe('Tanger');
      expect(cell('total_ttc')).toBe('19800.00 DH');
      expect(cell('designation')).toBe(
        'Transport international de Alicante à Tanger',
      );
    });

    it("always uses the invoice's own number, ignoring any sent in the request", async () => {
      await service.generate(1, { invoice_number: 'FAKE-1' } as never);
      expect(cell('invoice_number')).toBe('INV-2026-000021');
    });

    it("blanks out the template's sample values for fields that weren't sent", async () => {
      await service.generate(1, {});
      expect(cell('client_name')).toBe('');
      expect(cell('amount_in_words')).toBe('');
    });

    it('hides the surcharge rows when no surcharge is filled in', async () => {
      await service.generate(1, {});
      for (const row of SURCHARGE_ROWS) expect(rowHidden(row)).toBe(true);
    });

    it('shows the surcharge rows when any surcharge is filled in', async () => {
      await service.generate(1, { gazoil: '1500.00' });
      for (const row of SURCHARGE_ROWS) expect(rowHidden(row)).toBeFalsy();
    });

    it('hides the exchange-rate row when there is no rate', async () => {
      await service.generate(1, { total_ttc: '19800.00 DH' });
      for (const row of EXCHANGE_RATE_ROWS) expect(rowHidden(row)).toBe(true);
    });

    it('shows and fills the exchange-rate row when a rate is sent', async () => {
      await service.generate(1, {
        exchange_rate_line:
          'Taux de change EUR/MAD au 22/09/2026 : 1 EUR = 10,93 MAD',
        total_ttc_mad: '216414.00 DH',
      });

      for (const row of EXCHANGE_RATE_ROWS) expect(rowHidden(row)).toBeFalsy();
      expect(cell('exchange_rate_line')).toBe(
        'Taux de change EUR/MAD au 22/09/2026 : 1 EUR = 10,93 MAD',
      );
      expect(cell('total_ttc_mad')).toBe('216414.00 DH');
    });

    it('404s for an unknown invoice', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(null);
      await expect(service.generate(1, {})).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
