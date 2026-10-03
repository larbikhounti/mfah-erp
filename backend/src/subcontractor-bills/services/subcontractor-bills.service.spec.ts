import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Currency, ExecutionMode, Prisma } from '@prisma/client';
import { SubcontractorBillsService } from './subcontractor-bills.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const subcontractedMission = {
  id: 4,
  executionMode: ExecutionMode.SUBCONTRACTED,
  subcontractorId: 30,
  subcontractorCost: new Prisma.Decimal(9000),
  currency: Currency.MAD,
  subcontractorBill: null,
};

async function expectStatus(promise: Promise<unknown>, status: HttpStatus) {
  await expect(promise).rejects.toBeInstanceOf(HttpException);
  await promise.catch((e: HttpException) => expect(e.getStatus()).toBe(status));
}

describe('SubcontractorBillsService', () => {
  let service: SubcontractorBillsService;
  let prisma: PrismaMock;

  beforeEach(async () => {
    prisma = createPrismaMock();
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubcontractorBillsService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    service = moduleRef.get(SubcontractorBillsService);

    prisma.mission.findUnique.mockResolvedValue(subcontractedMission);
    prisma.subcontractorBill.count.mockResolvedValue(0);
    prisma.subcontractorBill.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 1, ...data }),
    );
  });

  it('takes amount, currency and subcontractor from the mission', async () => {
    await service.create({ missionId: 4, issueDate: new Date() });

    const { data } = prisma.subcontractorBill.create.mock.calls[0][0];
    const year = new Date().getFullYear();
    expect(data).toMatchObject({
      missionId: 4,
      subcontractorId: 30,
      amount: new Prisma.Decimal(9000),
      currency: Currency.MAD,
      billNumber: `BILL-${year}-000001`,
    });
  });

  it('only allows a bill on a SUBCONTRACTED mission', async () => {
    prisma.mission.findUnique.mockResolvedValue({
      ...subcontractedMission,
      executionMode: ExecutionMode.IN_HOUSE,
      subcontractorId: null,
    });
    await expectStatus(
      service.create({ missionId: 4, issueDate: new Date() }),
      HttpStatus.BAD_REQUEST,
    );
    expect(prisma.subcontractorBill.create).not.toHaveBeenCalled();
  });

  it('rejects a second bill for the same mission (strictly 1:1)', async () => {
    prisma.mission.findUnique.mockResolvedValue({
      ...subcontractedMission,
      subcontractorBill: { id: 2 },
    });
    await expectStatus(
      service.create({ missionId: 4, issueDate: new Date() }),
      HttpStatus.CONFLICT,
    );
  });

  it('rejects an unknown mission', async () => {
    prisma.mission.findUnique.mockResolvedValue(null);
    await expectStatus(
      service.create({ missionId: 4, issueDate: new Date() }),
      HttpStatus.BAD_REQUEST,
    );
  });
});
