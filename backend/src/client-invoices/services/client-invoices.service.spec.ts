import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Currency, InvoiceStatus, Prisma } from '@prisma/client';
import { ClientInvoicesService } from './client-invoices.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const mission = {
  id: 4,
  clientId: 2,
  clientPrice: new Prisma.Decimal(12000),
  currency: Currency.EUR,
  clientInvoice: null,
};

describe('ClientInvoicesService', () => {
  let service: ClientInvoicesService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        ClientInvoicesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(ClientInvoicesService);

    prisma.mission.findUnique.mockResolvedValue(mission);
    prisma.mission.findUniqueOrThrow.mockResolvedValue(mission);
    prisma.clientInvoice.count.mockResolvedValue(0);
    prisma.clientInvoice.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 1, ...data }),
    );
  });

  describe('create', () => {
    it('takes amount, currency and client from the mission, never from the request', async () => {
      await service.create({ missionId: 4, issueDate: new Date('2026-09-10') });

      const { data } = prisma.clientInvoice.create.mock.calls[0][0];
      expect(data).toMatchObject({
        missionId: 4,
        clientId: 2,
        amount: new Prisma.Decimal(12000),
        currency: Currency.EUR,
        dueDate: null,
      });
    });

    it('numbers invoices INV-<year>-<6 digits> from the yearly count', async () => {
      prisma.clientInvoice.count.mockResolvedValue(20);
      await service.create({ missionId: 4, issueDate: new Date() });

      const year = new Date().getFullYear();
      expect(
        prisma.clientInvoice.create.mock.calls[0][0].data.invoiceNumber,
      ).toBe(`INV-${year}-000021`);
    });

    it('rejects a second invoice for the same mission (strictly 1:1)', async () => {
      prisma.mission.findUnique.mockResolvedValue({
        ...mission,
        clientInvoice: { id: 9 },
      });
      const result = service.create({ missionId: 4, issueDate: new Date() });

      await expect(result).rejects.toBeInstanceOf(HttpException);
      await result.catch((e: HttpException) =>
        expect(e.getStatus()).toBe(HttpStatus.CONFLICT),
      );
      expect(prisma.clientInvoice.create).not.toHaveBeenCalled();
    });

    it('rejects an unknown mission', async () => {
      prisma.mission.findUnique.mockResolvedValue(null);
      await expect(
        service.create({ missionId: 99, issueDate: new Date() }),
      ).rejects.toThrow('Mission not found');
    });
  });

  describe('updatePayment', () => {
    beforeEach(() => {
      prisma.clientInvoice.findUnique.mockResolvedValue({
        id: 1,
        amount: new Prisma.Decimal(1000),
      });
      prisma.clientInvoice.update.mockImplementation(({ data }) =>
        Promise.resolve({ id: 1, ...data }),
      );
    });

    it.each([
      [0, InvoiceStatus.UNPAID],
      [400, InvoiceStatus.PARTIALLY_PAID],
      [1000, InvoiceStatus.PAID],
    ])('a payment of %d on 1000 marks it %s', async (amountPaid, status) => {
      const updated = await service.updatePayment(1, { amountPaid });
      expect(updated.status).toBe(status);
      expect(updated.amountPaid).toEqual(new Prisma.Decimal(amountPaid));
    });

    it('404s for an unknown invoice', async () => {
      prisma.clientInvoice.findUnique.mockResolvedValue(null);
      await expect(
        service.updatePayment(1, { amountPaid: 10 }),
      ).rejects.toThrow('Client invoice not found');
    });
  });
});
