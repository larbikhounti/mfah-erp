import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  DriverStatus,
  ExecutionMode,
  MissionStatus,
  Prisma,
  TruckStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMissionDto } from '../dtos/create-mission.dto';
import { UpdateMissionDto } from '../dtos/update-mission.dto';
import { UpdateMissionStatusDto } from '../dtos/update-mission-status.dto';
import { BulkDeleteMissionsDto } from '../dtos/bulk-delete-missions.dto';
import { FilterMissionsDto } from '../dtos/filter-missions.dto';
import { MissionResponse } from '../types/mission-response.type';
import { ClientInvoicesService } from '../../client-invoices/services/client-invoices.service';

const MAX_REFERENCE_ATTEMPTS = 5;

@Injectable()
export class MissionsService {
  private readonly logger = new Logger(MissionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly clientInvoicesService: ClientInvoicesService,
  ) {}

  async create(data: CreateMissionDto): Promise<MissionResponse> {
    const sanitized = await this.validateAndSanitize(data);

    for (let attempt = 0; attempt < MAX_REFERENCE_ATTEMPTS; attempt++) {
      const reference = await this.generateReference();

      try {
        const mission = await this.prisma.mission.create({
          data: {
            reference,
            clientId: sanitized.clientId,
            transportType: sanitized.transportType,
            executionMode: sanitized.executionMode,
            loadingLocation: sanitized.loadingLocation,
            deliveryLocation: sanitized.deliveryLocation,
            clientPrice: new Prisma.Decimal(sanitized.clientPrice),
            currency: sanitized.currency,
            subcontractorId: sanitized.subcontractorId,
            subcontractorCost:
              sanitized.subcontractorCost !== undefined &&
              sanitized.subcontractorCost !== null
                ? new Prisma.Decimal(sanitized.subcontractorCost)
                : null,
            truckId: sanitized.truckId,
            driverId: sanitized.driverId,
            missionDate: data.missionDate,
            autoInvoice: data.autoInvoice ?? false,
          },
        });

        if (mission.autoInvoice) {
          // The mission itself is already created and valid at this point —
          // if auto-invoicing fails (e.g. invoice-number collisions
          // exhausted), we log it rather than roll back the mission; staff
          // can still create the invoice manually via ClientInvoicesService.
          try {
            await this.clientInvoicesService.createForMission(
              mission.id,
              mission.missionDate,
              null,
            );
          } catch (invoiceError) {
            this.logger.error(
              `Mission ${mission.id} created but auto-invoice failed:`,
              invoiceError,
            );
          }
        }

        return mission;
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002' &&
          attempt < MAX_REFERENCE_ATTEMPTS - 1
        ) {
          // Reference collision under concurrent creation — retry with a new one.
          continue;
        }
        this.logger.error('Error creating mission:', error);
        if (error instanceof HttpException) {
          throw error;
        }
        throw new HttpException(
          'Error creating mission',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    throw new HttpException(
      'Could not generate a unique mission reference, please retry',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async findAll(
    filterParams: FilterMissionsDto,
  ): Promise<{ data: MissionResponse[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        status,
        transportType,
        executionMode,
        currency,
        clientId,
        subcontractorId,
        truckId,
        driverId,
        startDate,
        endDate,
        showArchived,
      } = filterParams;

      const where: any = {
        deletedAt: showArchived ? { not: null } : null,
      };

      if (search) {
        where.OR = [
          { reference: { contains: search, mode: 'insensitive' } },
          { loadingLocation: { contains: search, mode: 'insensitive' } },
          { deliveryLocation: { contains: search, mode: 'insensitive' } },
        ];
      }

      if (status) where.status = status;
      if (transportType) where.transportType = transportType;
      if (executionMode) where.executionMode = executionMode;
      if (currency) where.currency = currency;
      if (clientId) where.clientId = clientId;
      if (subcontractorId) where.subcontractorId = subcontractorId;
      if (truckId) where.truckId = truckId;
      if (driverId) where.driverId = driverId;

      if (startDate || endDate) {
        where.missionDate = {};
        if (startDate) where.missionDate.gte = startDate;
        if (endDate) where.missionDate.lte = endDate;
      }

      const [missions, total] = await Promise.all([
        this.prisma.mission.findMany({
          where,
          skip: offset,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.mission.count({ where }),
      ]);

      return { data: missions, total };
    } catch (error) {
      this.logger.error('Error fetching missions:', error);
      throw new HttpException(
        'Error fetching missions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<MissionResponse> {
    const mission = await this.prisma.mission.findUnique({ where: { id } });

    if (!mission) {
      throw new HttpException('Mission not found', HttpStatus.NOT_FOUND);
    }

    return mission;
  }

  async update(id: number, data: UpdateMissionDto): Promise<MissionResponse> {
    const existing = await this.prisma.mission.findUnique({ where: { id } });

    if (!existing) {
      throw new HttpException('Mission not found', HttpStatus.NOT_FOUND);
    }

    // Validate the *merged* final state, since a partial update might only
    // touch one side of the IN_HOUSE/SUBCONTRACTED pair.
    const merged = {
      clientId: data.clientId ?? existing.clientId,
      transportType: data.transportType ?? existing.transportType,
      executionMode: data.executionMode ?? existing.executionMode,
      loadingLocation: data.loadingLocation ?? existing.loadingLocation,
      deliveryLocation: data.deliveryLocation ?? existing.deliveryLocation,
      clientPrice: data.clientPrice ?? Number(existing.clientPrice),
      currency: data.currency ?? existing.currency,
      subcontractorId:
        data.subcontractorId ?? existing.subcontractorId ?? undefined,
      subcontractorCost:
        data.subcontractorCost ??
        (existing.subcontractorCost
          ? Number(existing.subcontractorCost)
          : undefined),
      truckId: data.truckId ?? existing.truckId ?? undefined,
      driverId: data.driverId ?? existing.driverId ?? undefined,
    };

    const sanitized = await this.validateAndSanitize(merged);

    try {
      return await this.prisma.mission.update({
        where: { id },
        data: {
          clientId: sanitized.clientId,
          transportType: sanitized.transportType,
          executionMode: sanitized.executionMode,
          loadingLocation: sanitized.loadingLocation,
          deliveryLocation: sanitized.deliveryLocation,
          clientPrice: new Prisma.Decimal(sanitized.clientPrice),
          currency: sanitized.currency,
          subcontractorId: sanitized.subcontractorId,
          subcontractorCost:
            sanitized.subcontractorCost !== undefined &&
            sanitized.subcontractorCost !== null
              ? new Prisma.Decimal(sanitized.subcontractorCost)
              : null,
          truckId: sanitized.truckId,
          driverId: sanitized.driverId,
          missionDate: data.missionDate ?? undefined,
          autoInvoice: data.autoInvoice ?? undefined,
        },
      });
    } catch (error) {
      this.logger.error(`Error updating mission with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating mission',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateStatus(
    id: number,
    dto: UpdateMissionStatusDto,
  ): Promise<MissionResponse> {
    const mission = await this.prisma.mission.findUnique({ where: { id } });

    if (!mission) {
      throw new HttpException('Mission not found', HttpStatus.NOT_FOUND);
    }

    const oldStatus = mission.status;
    const newStatus = dto.status;

    const enteringInProgress =
      newStatus === MissionStatus.IN_PROGRESS &&
      oldStatus !== MissionStatus.IN_PROGRESS;
    const leavingInProgress =
      oldStatus === MissionStatus.IN_PROGRESS &&
      (newStatus === MissionStatus.FINISHED ||
        newStatus === MissionStatus.CANCELLED);

    try {
      const [updated] = await this.prisma.$transaction([
        this.prisma.mission.update({
          where: { id },
          data: { status: newStatus },
        }),
        ...(mission.executionMode === ExecutionMode.IN_HOUSE &&
        enteringInProgress
          ? this.truckDriverStatusUpdates(mission.truckId, mission.driverId, {
              truck: TruckStatus.EN_MISSION,
              driver: DriverStatus.EN_MISSION,
            })
          : []),
        ...(mission.executionMode === ExecutionMode.IN_HOUSE &&
        leavingInProgress
          ? this.truckDriverStatusUpdates(mission.truckId, mission.driverId, {
              truck: TruckStatus.DISPO,
              driver: DriverStatus.ACTIF,
            })
          : []),
      ]);

      return updated;
    } catch (error) {
      this.logger.error(`Error updating status for mission ${id}:`, error);
      throw new HttpException(
        'Error updating mission status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private truckDriverStatusUpdates(
    truckId: number | null,
    driverId: number | null,
    to: { truck: TruckStatus; driver: DriverStatus },
  ) {
    const updates: Prisma.PrismaPromise<any>[] = [];

    if (truckId) {
      updates.push(
        this.prisma.truck.update({
          where: { id: truckId },
          data: { status: to.truck },
        }),
      );
    }

    if (driverId) {
      updates.push(
        this.prisma.driver.update({
          where: { id: driverId },
          data: { status: to.driver },
        }),
      );
    }

    return updates;
  }

  async remove(id: number): Promise<{ message: string }> {
    const mission = await this.prisma.mission.findUnique({ where: { id } });

    if (!mission) {
      throw new HttpException('Mission not found', HttpStatus.NOT_FOUND);
    }

    if (mission.deletedAt) {
      throw new HttpException(
        'Mission is already deleted',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.mission.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Mission deleted successfully' };
  }

  async bulkDelete(dto: BulkDeleteMissionsDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    const { missionIds } = dto;

    const existing = await this.prisma.mission.findMany({
      where: { id: { in: missionIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((m) => m.id);
    const notFoundIds = missionIds.filter((id) => !existingIds.includes(id));

    const alreadyDeletedIds = existing
      .filter((m) => m.deletedAt !== null)
      .map((m) => m.id);
    const deletableIds = existingIds.filter(
      (id) => !alreadyDeletedIds.includes(id),
    );

    const result = await this.prisma.mission.updateMany({
      where: { id: { in: deletableIds } },
      data: { deletedAt: new Date() },
    });

    return {
      message: `Bulk delete completed. ${result.count} missions deleted.`,
      deletedCount: result.count,
      notFound: notFoundIds,
      alreadyDeleted: alreadyDeletedIds,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    const mission = await this.prisma.mission.findUnique({ where: { id } });

    if (!mission) {
      throw new HttpException('Mission not found', HttpStatus.NOT_FOUND);
    }

    if (!mission.deletedAt) {
      throw new HttpException('Mission is not deleted', HttpStatus.BAD_REQUEST);
    }

    await this.prisma.mission.update({
      where: { id },
      data: { deletedAt: null },
    });

    return { message: 'Mission restored successfully' };
  }

  async bulkRestore(missionIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    const existing = await this.prisma.mission.findMany({
      where: { id: { in: missionIds } },
      select: { id: true, deletedAt: true },
    });

    const existingIds = existing.map((m) => m.id);
    const notFoundIds = missionIds.filter((id) => !existingIds.includes(id));

    const notDeletedIds = existing
      .filter((m) => m.deletedAt === null)
      .map((m) => m.id);
    const restorableIds = existingIds.filter(
      (id) => !notDeletedIds.includes(id),
    );

    const result = await this.prisma.mission.updateMany({
      where: { id: { in: restorableIds } },
      data: { deletedAt: null },
    });

    return {
      message: `Bulk restore completed. ${result.count} missions restored successfully.`,
      restoredCount: result.count,
      notFound: notFoundIds,
      notDeleted: notDeletedIds,
    };
  }

  /**
   * Enforces the IN_HOUSE/SUBCONTRACTED XOR (Prisma has no declarative way to
   * express it), checks that referenced entities exist, and strips whichever
   * side doesn't apply so the stored data never has both a truck+driver and a
   * subcontractor set at once.
   */
  private async validateAndSanitize(data: {
    clientId: number;
    transportType: any;
    executionMode: ExecutionMode;
    loadingLocation: string;
    deliveryLocation: string;
    clientPrice: number;
    currency: any;
    subcontractorId?: number;
    subcontractorCost?: number;
    truckId?: number;
    driverId?: number;
  }) {
    const client = await this.prisma.client.findUnique({
      where: { id: data.clientId },
    });
    if (!client) {
      throw new HttpException('Client not found', HttpStatus.BAD_REQUEST);
    }

    if (data.executionMode === ExecutionMode.IN_HOUSE) {
      if (!data.truckId || !data.driverId) {
        throw new HttpException(
          'truckId and driverId are required when executionMode is IN_HOUSE',
          HttpStatus.BAD_REQUEST,
        );
      }

      const [truck, driver] = await Promise.all([
        this.prisma.truck.findUnique({ where: { id: data.truckId } }),
        this.prisma.driver.findUnique({ where: { id: data.driverId } }),
      ]);

      if (!truck) {
        throw new HttpException('Truck not found', HttpStatus.BAD_REQUEST);
      }
      if (!driver) {
        throw new HttpException('Driver not found', HttpStatus.BAD_REQUEST);
      }

      return {
        ...data,
        subcontractorId: null,
        subcontractorCost: null,
      };
    }

    // SUBCONTRACTED
    if (!data.subcontractorId || data.subcontractorCost === undefined) {
      throw new HttpException(
        'subcontractorId and subcontractorCost are required when executionMode is SUBCONTRACTED',
        HttpStatus.BAD_REQUEST,
      );
    }

    const subcontractor = await this.prisma.subcontractor.findUnique({
      where: { id: data.subcontractorId },
    });
    if (!subcontractor) {
      throw new HttpException(
        'Subcontractor not found',
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      ...data,
      truckId: null,
      driverId: null,
    };
  }

  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `MIS-${year}-`;

    const count = await this.prisma.mission.count({
      where: { reference: { startsWith: prefix } },
    });

    return `${prefix}${String(count + 1).padStart(6, '0')}`;
  }
}
