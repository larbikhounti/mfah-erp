import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AttachmentCategory, MissionStatus, Prisma } from '@prisma/client';
import { DriverMissionsService } from './driver-missions.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MissionLifecycleService } from '../../missions/services/mission-lifecycle.service';
import { AttachmentsService } from '../../attachments/services/attachments.service';
import { FuelEntriesService } from '../../fuel-entries/services/fuel-entries.service';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const DRIVER_ID = 20;

const ownMission = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  reference: 'MIS-2026-000001',
  status: MissionStatus.PLANNED,
  driverId: DRIVER_ID,
  truckId: 10,
  clientPrice: new Prisma.Decimal(2500),
  truck: { id: 10, plateNumber: '12345-A-6' },
  ...overrides,
});

async function expectStatus(promise: Promise<unknown>, status: HttpStatus) {
  const error = await promise.catch((e: HttpException) => e);
  expect(error).toBeInstanceOf(HttpException);
  expect((error as HttpException).getStatus()).toBe(status);
}

describe('DriverMissionsService', () => {
  let service: DriverMissionsService;
  let prisma: PrismaMock;
  let lifecycle: { transition: jest.Mock };

  beforeEach(async () => {
    prisma = createPrismaMock();
    lifecycle = { transition: jest.fn().mockResolvedValue({}) };

    const moduleRef = await Test.createTestingModule({
      providers: [
        DriverMissionsService,
        { provide: PrismaService, useValue: prisma },
        { provide: MissionLifecycleService, useValue: lifecycle },
        {
          provide: AttachmentsService,
          useValue: { findForMission: jest.fn().mockResolvedValue([]) },
        },
        {
          provide: FuelEntriesService,
          useValue: { totals: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();
    service = moduleRef.get(DriverMissionsService);

    prisma.fuelEntry.count.mockResolvedValue(0);
  });

  it("only ever looks up the driver's own, live, in-house missions", async () => {
    prisma.mission.findFirst.mockResolvedValue(ownMission());

    await service.detail(DRIVER_ID, 1);

    expect(prisma.mission.findFirst.mock.calls[0][0].where).toMatchObject({
      id: 1,
      driverId: DRIVER_ID,
      executionMode: 'IN_HOUSE',
      deletedAt: null,
    });
  });

  it("404s on someone else's mission", async () => {
    prisma.mission.findFirst.mockResolvedValue(null);
    await expectStatus(service.detail(DRIVER_ID, 99), HttpStatus.NOT_FOUND);
  });

  it('never sends prices to the driver', async () => {
    prisma.mission.findFirst.mockResolvedValue(ownMission());

    const detail = await service.detail(DRIVER_ID, 1);

    expect(detail).not.toHaveProperty('clientPrice');
    expect(detail.truck).toEqual({ id: 10, plateNumber: '12345-A-6' });
  });

  describe('confirm loading', () => {
    it('moves a planned mission to IN_PROGRESS', async () => {
      prisma.mission.findFirst
        .mockResolvedValueOnce(ownMission()) // ownership check
        .mockResolvedValueOnce(null) // no other mission on the road
        .mockResolvedValue(ownMission({ status: MissionStatus.IN_PROGRESS }));

      await service.confirmLoading(DRIVER_ID, 1);

      expect(lifecycle.transition).toHaveBeenCalledWith(
        1,
        MissionStatus.IN_PROGRESS,
        { allowedFrom: [MissionStatus.PLANNED] },
      );
    });

    it('refuses while another mission is still in progress', async () => {
      prisma.mission.findFirst
        .mockResolvedValueOnce(ownMission())
        .mockResolvedValueOnce({ reference: 'MIS-2026-000002' });

      await expectStatus(
        service.confirmLoading(DRIVER_ID, 1),
        HttpStatus.CONFLICT,
      );
      expect(lifecycle.transition).not.toHaveBeenCalled();
    });
  });

  describe('complete', () => {
    it('requires a signed CMR', async () => {
      prisma.mission.findFirst.mockResolvedValue(
        ownMission({ status: MissionStatus.IN_PROGRESS }),
      );
      prisma.attachment.count.mockResolvedValue(0);

      await expectStatus(
        service.complete(DRIVER_ID, 1),
        HttpStatus.BAD_REQUEST,
      );
      expect(prisma.attachment.count).toHaveBeenCalledWith({
        where: { missionId: 1, category: AttachmentCategory.CMR },
      });
    });

    it('sends the mission to PENDING_REVIEW with the comment', async () => {
      prisma.mission.findFirst.mockResolvedValue(
        ownMission({ status: MissionStatus.IN_PROGRESS }),
      );
      prisma.attachment.count.mockResolvedValue(1);

      await service.complete(DRIVER_ID, 1, '  All good  ');

      expect(lifecycle.transition).toHaveBeenCalledWith(
        1,
        MissionStatus.PENDING_REVIEW,
        {
          allowedFrom: [MissionStatus.IN_PROGRESS],
          extraData: { completionComment: 'All good' },
        },
      );
    });

    it('cannot complete a mission that has not started', async () => {
      prisma.mission.findFirst.mockResolvedValue(ownMission());
      await expectStatus(service.complete(DRIVER_ID, 1), HttpStatus.CONFLICT);
    });
  });

  it('refuses closure uploads once the mission is in review', async () => {
    prisma.mission.findFirst.mockResolvedValue(
      ownMission({ status: MissionStatus.PENDING_REVIEW }),
    );

    await expectStatus(
      service.uploadClosureFile(DRIVER_ID, 1, AttachmentCategory.CMR, {
        buffer: Buffer.from(''),
        originalname: 'cmr.pdf',
        mimetype: 'application/pdf',
      }),
      HttpStatus.CONFLICT,
    );
  });
});
