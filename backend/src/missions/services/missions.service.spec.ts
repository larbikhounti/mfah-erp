import { HttpException, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {
  Currency,
  DriverStatus,
  ExecutionMode,
  InvoiceStatus,
  MissionStatus,
  Prisma,
  TransportType,
  TruckStatus,
} from '@prisma/client';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { MissionsService } from './missions.service';
import { MissionLifecycleService } from './mission-lifecycle.service';
import { MissionEvents } from '../events/mission.events';
import { PrismaService } from '../../prisma/prisma.service';
import { ClientInvoicesService } from '../../client-invoices/services/client-invoices.service';
import { CreateMissionDto } from '../dtos/create-mission.dto';
import {
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const inHouseDto = (
  overrides: Partial<CreateMissionDto> = {},
): CreateMissionDto => ({
  clientId: 1,
  transportType: TransportType.EXPORT,
  executionMode: ExecutionMode.IN_HOUSE,
  loadingLocation: 'Tanger',
  deliveryLocation: 'Madrid',
  clientPrice: 15000,
  currency: Currency.MAD,
  truckId: 10,
  driverId: 20,
  missionDate: new Date('2026-09-01'),
  ...overrides,
});

const subcontractedDto = (
  overrides: Partial<CreateMissionDto> = {},
): CreateMissionDto =>
  inHouseDto({
    executionMode: ExecutionMode.SUBCONTRACTED,
    truckId: undefined,
    driverId: undefined,
    subcontractorId: 30,
    subcontractorCost: 9000,
    ...overrides,
  });

/** A stored mission row, as Prisma would return it. */
const storedMission = (overrides: Record<string, unknown> = {}) => ({
  id: 1,
  reference: 'MIS-2026-000001',
  clientId: 1,
  transportType: TransportType.EXPORT,
  executionMode: ExecutionMode.IN_HOUSE,
  loadingLocation: 'Tanger',
  deliveryLocation: 'Madrid',
  clientPrice: new Prisma.Decimal(15000),
  currency: Currency.MAD,
  exchangeRate: null,
  subcontractorId: null,
  subcontractorCost: null,
  truckId: 10,
  driverId: 20,
  contractorTruckId: null,
  status: MissionStatus.PLANNED,
  missionDate: new Date('2026-09-01'),
  autoInvoice: false,
  clientInvoice: null,
  subcontractorBill: null,
  deletedAt: null,
  ...overrides,
});

async function expectHttpError(promise: Promise<unknown>, status: HttpStatus) {
  await expect(promise).rejects.toBeInstanceOf(HttpException);
  await promise.catch((e: HttpException) => expect(e.getStatus()).toBe(status));
}

describe('MissionsService', () => {
  let service: MissionsService;
  let prisma: PrismaMock;
  let clientInvoices: { createForMission: jest.Mock };
  let events: { emit: jest.Mock };

  beforeEach(async () => {
    prisma = createPrismaMock();
    clientInvoices = { createForMission: jest.fn() };
    events = { emit: jest.fn() };

    const moduleRef = await Test.createTestingModule({
      providers: [
        MissionsService,
        { provide: PrismaService, useValue: prisma },
        MissionLifecycleService,
        { provide: ClientInvoicesService, useValue: clientInvoices },
        { provide: EventEmitter2, useValue: events },
      ],
    }).compile();
    service = moduleRef.get(MissionsService);

    // Every referenced entity exists unless a test says otherwise.
    prisma.client.findUnique.mockResolvedValue({ id: 1 });
    prisma.truck.findUnique.mockResolvedValue({ id: 10 });
    prisma.driver.findUnique.mockResolvedValue({ id: 20 });
    prisma.subcontractor.findUnique.mockResolvedValue({ id: 30 });
    prisma.mission.count.mockResolvedValue(0);
    prisma.mission.create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 1, ...data }),
    );
    prisma.mission.update.mockImplementation(({ data }) =>
      Promise.resolve({ id: 1, ...data }),
    );
  });

  describe('create — execution mode rules', () => {
    it('creates an IN_HOUSE mission and strips any subcontractor fields', async () => {
      await service.create(
        inHouseDto({ subcontractorId: 30, subcontractorCost: 500 }),
      );

      const { data } = prisma.mission.create.mock.calls[0][0];
      expect(data.truckId).toBe(10);
      expect(data.driverId).toBe(20);
      expect(data.subcontractorId).toBeNull();
      expect(data.subcontractorCost).toBeNull();
      expect(data.contractorTruckId).toBeNull();
    });

    it('rejects an IN_HOUSE mission without a truck or driver', async () => {
      await expectHttpError(
        service.create(inHouseDto({ truckId: undefined })),
        HttpStatus.BAD_REQUEST,
      );
      await expectHttpError(
        service.create(inHouseDto({ driverId: undefined })),
        HttpStatus.BAD_REQUEST,
      );
      expect(prisma.mission.create).not.toHaveBeenCalled();
    });

    it('rejects an IN_HOUSE mission whose truck or driver does not exist', async () => {
      prisma.truck.findUnique.mockResolvedValue(null);
      await expectHttpError(
        service.create(inHouseDto()),
        HttpStatus.BAD_REQUEST,
      );
    });

    it('creates a SUBCONTRACTED mission and strips truck/driver', async () => {
      await service.create(subcontractedDto({ truckId: 10, driverId: 20 }));

      const { data } = prisma.mission.create.mock.calls[0][0];
      expect(data.subcontractorId).toBe(30);
      expect(data.subcontractorCost).toEqual(new Prisma.Decimal(9000));
      expect(data.truckId).toBeNull();
      expect(data.driverId).toBeNull();
    });

    it('rejects a SUBCONTRACTED mission without subcontractor or cost', async () => {
      await expectHttpError(
        service.create(subcontractedDto({ subcontractorId: undefined })),
        HttpStatus.BAD_REQUEST,
      );
      await expectHttpError(
        service.create(subcontractedDto({ subcontractorCost: undefined })),
        HttpStatus.BAD_REQUEST,
      );
    });

    it('rejects a contractor truck that belongs to a different subcontractor', async () => {
      prisma.contractorTruck.findUnique.mockResolvedValue({
        id: 5,
        subcontractorId: 999,
      });
      await expectHttpError(
        service.create(subcontractedDto({ contractorTruckId: 5 })),
        HttpStatus.BAD_REQUEST,
      );
    });

    it('rejects an unknown client', async () => {
      prisma.client.findUnique.mockResolvedValue(null);
      await expectHttpError(
        service.create(inHouseDto()),
        HttpStatus.BAD_REQUEST,
      );
    });
  });

  describe('create — reference & auto-invoice', () => {
    it('generates a MIS-<year>-<6 digit> reference from the yearly count', async () => {
      prisma.mission.count.mockResolvedValue(41);
      await service.create(inHouseDto());

      const year = new Date().getFullYear();
      expect(prisma.mission.create.mock.calls[0][0].data.reference).toBe(
        `MIS-${year}-000042`,
      );
    });

    it('retries with a new reference on a unique-constraint collision', async () => {
      const collision = new Prisma.PrismaClientKnownRequestError('dup', {
        code: 'P2002',
        clientVersion: 'test',
      });
      prisma.mission.create
        .mockRejectedValueOnce(collision)
        .mockImplementationOnce(({ data }) =>
          Promise.resolve({ id: 1, ...data }),
        );

      await service.create(inHouseDto());
      expect(prisma.mission.create).toHaveBeenCalledTimes(2);
    });

    it('creates the client invoice when autoInvoice is on', async () => {
      await service.create(inHouseDto({ autoInvoice: true }));
      expect(clientInvoices.createForMission).toHaveBeenCalledWith(
        1,
        expect.any(Date),
        null,
      );
    });

    it('does not create an invoice when autoInvoice is off', async () => {
      await service.create(inHouseDto());
      expect(clientInvoices.createForMission).not.toHaveBeenCalled();
    });

    it('still returns the mission if auto-invoicing fails', async () => {
      clientInvoices.createForMission.mockRejectedValue(new Error('boom'));
      jest
        .spyOn(service['logger'], 'error')
        .mockImplementation(() => undefined);

      await expect(
        service.create(inHouseDto({ autoInvoice: true })),
      ).resolves.toMatchObject({ id: 1 });
    });
  });

  describe('exchange rate (EUR→MAD)', () => {
    it('stores the rate on a EUR mission', async () => {
      await service.create(
        inHouseDto({ currency: Currency.EUR, exchangeRate: 10.93 }),
      );
      expect(prisma.mission.create.mock.calls[0][0].data.exchangeRate).toEqual(
        new Prisma.Decimal(10.93),
      );
    });

    it('drops the rate on a MAD mission', async () => {
      await service.create(
        inHouseDto({ currency: Currency.MAD, exchangeRate: 10.93 }),
      );
      expect(
        prisma.mission.create.mock.calls[0][0].data.exchangeRate,
      ).toBeNull();
    });

    it('allows a EUR mission without a rate', async () => {
      await service.create(inHouseDto({ currency: Currency.EUR }));
      expect(
        prisma.mission.create.mock.calls[0][0].data.exchangeRate,
      ).toBeNull();
    });

    it('keeps the stored rate on a partial update that does not mention it', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          currency: Currency.EUR,
          exchangeRate: new Prisma.Decimal(10.93),
        }),
      );
      await service.update(1, { loadingLocation: 'Tanger Med' });
      expect(prisma.mission.update.mock.calls[0][0].data.exchangeRate).toEqual(
        new Prisma.Decimal(10.93),
      );
    });

    it('changes the rate when a new one is sent', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          currency: Currency.EUR,
          exchangeRate: new Prisma.Decimal(10.93),
        }),
      );
      await service.update(1, { exchangeRate: 11.05 });
      expect(prisma.mission.update.mock.calls[0][0].data.exchangeRate).toEqual(
        new Prisma.Decimal(11.05),
      );
    });

    it('clears the rate when null is sent', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          currency: Currency.EUR,
          exchangeRate: new Prisma.Decimal(10.93),
        }),
      );
      await service.update(1, { exchangeRate: null });
      expect(
        prisma.mission.update.mock.calls[0][0].data.exchangeRate,
      ).toBeNull();
    });

    it('clears the rate when the mission is switched to MAD', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          currency: Currency.EUR,
          exchangeRate: new Prisma.Decimal(10.93),
        }),
      );
      await service.update(1, { currency: Currency.MAD });
      expect(
        prisma.mission.update.mock.calls[0][0].data.exchangeRate,
      ).toBeNull();
    });
  });

  describe('update — keeping invoices/bills in sync', () => {
    it('404s for an unknown mission', async () => {
      prisma.mission.findUnique.mockResolvedValue(null);
      await expectHttpError(service.update(1, {}), HttpStatus.NOT_FOUND);
    });

    it('updates the client invoice amount/currency and recomputes its status when the price changes', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          clientInvoice: {
            id: 7,
            status: InvoiceStatus.PARTIALLY_PAID,
            amountPaid: new Prisma.Decimal(20000),
          },
        }),
      );
      prisma.clientInvoice.update.mockResolvedValue({});

      await service.update(1, { clientPrice: 20000 });

      const { where, data } = prisma.clientInvoice.update.mock.calls[0][0];
      expect(where).toEqual({ id: 7 });
      expect(data.amount).toEqual(new Prisma.Decimal(20000));
      expect(data.status).toBe(InvoiceStatus.PAID); // 20000 paid of 20000
    });

    it('does not touch the client invoice when nothing billed changed', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          clientInvoice: {
            id: 7,
            status: InvoiceStatus.UNPAID,
            amountPaid: new Prisma.Decimal(0),
          },
        }),
      );
      await service.update(1, { loadingLocation: 'Tanger Med' });
      expect(prisma.clientInvoice.update).not.toHaveBeenCalled();
    });

    it('refuses to change the price of a mission whose client invoice is fully paid', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          clientInvoice: {
            id: 7,
            status: InvoiceStatus.PAID,
            amountPaid: new Prisma.Decimal(15000),
          },
        }),
      );
      await expectHttpError(
        service.update(1, { clientPrice: 16000 }),
        HttpStatus.CONFLICT,
      );
      expect(prisma.mission.update).not.toHaveBeenCalled();
    });

    it('refuses to switch a mission away from SUBCONTRACTED once it has a subcontractor bill', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          executionMode: ExecutionMode.SUBCONTRACTED,
          truckId: null,
          driverId: null,
          subcontractorId: 30,
          subcontractorCost: new Prisma.Decimal(9000),
          subcontractorBill: {
            id: 3,
            status: InvoiceStatus.UNPAID,
            amountPaid: new Prisma.Decimal(0),
          },
        }),
      );
      await expectHttpError(
        service.update(1, {
          executionMode: ExecutionMode.IN_HOUSE,
          truckId: 10,
          driverId: 20,
        }),
        HttpStatus.CONFLICT,
      );
    });

    it('updates the subcontractor bill when the subcontractor cost changes', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          executionMode: ExecutionMode.SUBCONTRACTED,
          truckId: null,
          driverId: null,
          subcontractorId: 30,
          subcontractorCost: new Prisma.Decimal(9000),
          subcontractorBill: {
            id: 3,
            status: InvoiceStatus.UNPAID,
            amountPaid: new Prisma.Decimal(0),
          },
        }),
      );
      prisma.subcontractorBill.update.mockResolvedValue({});

      await service.update(1, { subcontractorCost: 9500 });

      const { data } = prisma.subcontractorBill.update.mock.calls[0][0];
      expect(data.amount).toEqual(new Prisma.Decimal(9500));
      expect(data.status).toBe(InvoiceStatus.UNPAID);
    });
  });

  describe('updateStatus — truck/driver availability', () => {
    beforeEach(() => {
      prisma.truck.update.mockResolvedValue({});
      prisma.driver.update.mockResolvedValue({});
    });

    it('puts the truck and driver EN_MISSION when an IN_HOUSE mission starts', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({ status: MissionStatus.PLANNED }),
      );

      await service.updateStatus(1, { status: MissionStatus.IN_PROGRESS });

      expect(prisma.truck.update).toHaveBeenCalledWith({
        where: { id: 10 },
        data: { status: TruckStatus.EN_MISSION },
      });
      expect(prisma.driver.update).toHaveBeenCalledWith({
        where: { id: 20 },
        data: { status: DriverStatus.EN_MISSION },
      });
    });

    it.each([
      MissionStatus.PENDING_REVIEW,
      MissionStatus.FINISHED,
      MissionStatus.CANCELLED,
    ])(
      'frees the truck and driver when an in-progress mission becomes %s',
      async (status) => {
        prisma.mission.findUnique.mockResolvedValue(
          storedMission({ status: MissionStatus.IN_PROGRESS }),
        );

        await service.updateStatus(1, { status });

        expect(prisma.truck.update).toHaveBeenCalledWith({
          where: { id: 10 },
          data: { status: TruckStatus.DISPO },
        });
        expect(prisma.driver.update).toHaveBeenCalledWith({
          where: { id: 20 },
          data: { status: DriverStatus.ACTIF },
        });
      },
    );

    it('never touches trucks/drivers for a SUBCONTRACTED mission', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({
          executionMode: ExecutionMode.SUBCONTRACTED,
          truckId: null,
          driverId: null,
        }),
      );

      await service.updateStatus(1, { status: MissionStatus.IN_PROGRESS });

      expect(prisma.truck.update).not.toHaveBeenCalled();
      expect(prisma.driver.update).not.toHaveBeenCalled();
    });

    it('does nothing to the truck/driver when the mission was already in progress', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({ status: MissionStatus.IN_PROGRESS }),
      );

      await service.updateStatus(1, { status: MissionStatus.IN_PROGRESS });

      expect(prisma.truck.update).not.toHaveBeenCalled();
    });

    it('runs the status change and the truck/driver changes in one transaction', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({ status: MissionStatus.PLANNED }),
      );

      await service.updateStatus(1, { status: MissionStatus.IN_PROGRESS });

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(prisma.$transaction.mock.calls[0][0]).toHaveLength(3);
    });
  });

  describe('driver portal workflow', () => {
    beforeEach(() => {
      prisma.truck.update.mockResolvedValue({});
      prisma.driver.update.mockResolvedValue({});
    });

    it('stamps loadingConfirmedAt when a mission starts', async () => {
      prisma.mission.findUnique.mockResolvedValue(storedMission());

      await service.updateStatus(1, { status: MissionStatus.IN_PROGRESS });

      const { data } = prisma.mission.update.mock.calls[0][0];
      expect(data.loadingConfirmedAt).toBeInstanceOf(Date);
    });

    it('guards the status update against a concurrent transition', async () => {
      prisma.mission.findUnique.mockResolvedValue(storedMission());

      await service.updateStatus(1, { status: MissionStatus.IN_PROGRESS });

      expect(prisma.mission.update.mock.calls[0][0].where).toEqual({
        id: 1,
        status: MissionStatus.PLANNED,
      });
    });

    it('approves a mission pending review and stamps reviewedAt', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({ status: MissionStatus.PENDING_REVIEW }),
      );

      await service.approveReview(1);

      const { data } = prisma.mission.update.mock.calls[0][0];
      expect(data.status).toBe(MissionStatus.FINISHED);
      expect(data.reviewedAt).toBeInstanceOf(Date);
      expect(prisma.truck.update).not.toHaveBeenCalled();
    });

    it('refuses to approve a mission that is not pending review', async () => {
      prisma.mission.findUnique.mockResolvedValue(
        storedMission({ status: MissionStatus.IN_PROGRESS }),
      );

      await expectHttpError(service.approveReview(1), HttpStatus.CONFLICT);
      expect(prisma.mission.update).not.toHaveBeenCalled();
    });
  });

  describe('driver notifications (domain events)', () => {
    it('announces the assigned driver when an IN_HOUSE mission is created', async () => {
      await service.create(inHouseDto());

      expect(events.emit).toHaveBeenCalledWith(
        MissionEvents.DRIVER_ASSIGNED,
        expect.objectContaining({ driverId: 20 }),
      );
    });

    it('emits nothing for a SUBCONTRACTED mission', async () => {
      await service.create(subcontractedDto());
      expect(events.emit).not.toHaveBeenCalled();
    });

    it('tells the old driver they were removed and the new one they were assigned', async () => {
      prisma.mission.findUnique.mockResolvedValue(storedMission());
      prisma.mission.update.mockResolvedValue(storedMission({ driverId: 21 }));

      await service.update(1, { driverId: 21 });

      expect(events.emit).toHaveBeenCalledWith(
        MissionEvents.DRIVER_UNASSIGNED,
        expect.objectContaining({ driverId: 20 }),
      );
      expect(events.emit).toHaveBeenCalledWith(
        MissionEvents.DRIVER_ASSIGNED,
        expect.objectContaining({ driverId: 21 }),
      );
    });

    it('notifies the driver when a visible detail changes', async () => {
      prisma.mission.findUnique.mockResolvedValue(storedMission());
      prisma.mission.update.mockResolvedValue(
        storedMission({ deliveryLocation: 'Barcelona' }),
      );

      await service.update(1, { deliveryLocation: 'Barcelona' });

      expect(events.emit).toHaveBeenCalledWith(
        MissionEvents.DETAILS_CHANGED,
        expect.objectContaining({ driverId: 20 }),
      );
    });

    it('stays quiet when only billing changes', async () => {
      prisma.mission.findUnique.mockResolvedValue(storedMission());
      prisma.mission.update.mockResolvedValue(
        storedMission({ clientPrice: new Prisma.Decimal(16000) }),
      );

      await service.update(1, { clientPrice: 16000 });

      expect(events.emit).not.toHaveBeenCalled();
    });

    it('stays quiet about finished missions', async () => {
      const finished = storedMission({ status: MissionStatus.FINISHED });
      prisma.mission.findUnique.mockResolvedValue(finished);
      prisma.mission.update.mockResolvedValue({
        ...finished,
        deliveryLocation: 'Barcelona',
      });

      await service.update(1, { deliveryLocation: 'Barcelona' });

      expect(events.emit).not.toHaveBeenCalled();
    });

    it('announces a cancellation to the driver', async () => {
      prisma.mission.findUnique.mockResolvedValue(storedMission());

      await service.updateStatus(1, { status: MissionStatus.CANCELLED });

      expect(events.emit).toHaveBeenCalledWith(
        MissionEvents.CANCELLED,
        expect.objectContaining({ missionId: 1, driverId: 20 }),
      );
    });
  });
});
