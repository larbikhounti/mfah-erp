import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  DriverStatus,
  ExecutionMode,
  Mission,
  MissionStatus,
  Prisma,
  TruckStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MissionDriverEvent, MissionEvents } from '../events/mission.events';
import { MissionResponse } from '../types/mission-response.type';

/** Statuses during which the mission's truck and driver are on the road. */
const OCCUPYING_STATUSES: ReadonlySet<MissionStatus> = new Set([
  MissionStatus.IN_PROGRESS,
]);

export interface TransitionOptions {
  /** Only allow the transition from one of these statuses (409 otherwise). */
  allowedFrom?: MissionStatus[];
  /** Extra mission fields written in the same update (e.g. a comment). */
  extraData?: Prisma.MissionUpdateInput;
}

/**
 * The single place where a mission changes status, used by both the staff
 * status endpoint and the driver portal. Owns every side effect of a
 * transition so they can never drift apart between callers:
 * - truck/driver availability (IN_HOUSE only): EN_MISSION while the mission
 *   is IN_PROGRESS, back to DISPO/ACTIF as soon as it leaves it — including
 *   PENDING_REVIEW, since the truck is physically free once delivered;
 * - workflow timestamps (loadingConfirmedAt, completedAt, reviewedAt);
 * - the CANCELLED domain event.
 */
@Injectable()
export class MissionLifecycleService {
  private readonly logger = new Logger(MissionLifecycleService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventEmitter2,
  ) {}

  async transition(
    missionId: number,
    newStatus: MissionStatus,
    options: TransitionOptions = {},
  ): Promise<MissionResponse> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission || mission.deletedAt) {
      throw new NotFoundException('Mission not found');
    }

    if (options.allowedFrom && !options.allowedFrom.includes(mission.status)) {
      throw new ConflictException(
        `Mission is ${mission.status}, expected ${options.allowedFrom.join(' or ')}`,
      );
    }

    try {
      const [updated] = await this.prisma.$transaction([
        this.prisma.mission.update({
          // Matching on the status we read guards against two concurrent
          // transitions (e.g. a double-tapped button) both applying.
          where: { id: missionId, status: mission.status },
          data: {
            status: newStatus,
            ...this.timestampsFor(mission, newStatus),
            ...options.extraData,
          },
        }),
        ...this.availabilityUpdates(mission, newStatus),
      ]);

      this.emitTransitionEvents(mission, newStatus);
      return updated;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new ConflictException(
          'Mission status changed in the meantime, please refresh',
        );
      }
      this.logger.error(
        `Error updating status for mission ${missionId}:`,
        error,
      );
      throw new HttpException(
        'Error updating mission status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private timestampsFor(
    mission: Mission,
    newStatus: MissionStatus,
  ): Prisma.MissionUpdateInput {
    const now = new Date();
    switch (newStatus) {
      case MissionStatus.IN_PROGRESS:
        return { loadingConfirmedAt: mission.loadingConfirmedAt ?? now };
      case MissionStatus.PENDING_REVIEW:
        return { completedAt: now };
      case MissionStatus.FINISHED:
        return mission.status === MissionStatus.PENDING_REVIEW
          ? { reviewedAt: now }
          : {};
      default:
        return {};
    }
  }

  private availabilityUpdates(
    mission: Mission,
    newStatus: MissionStatus,
  ): Prisma.PrismaPromise<unknown>[] {
    if (mission.executionMode !== ExecutionMode.IN_HOUSE) {
      return [];
    }

    const wasOccupying = OCCUPYING_STATUSES.has(mission.status);
    const isOccupying = OCCUPYING_STATUSES.has(newStatus);

    if (!wasOccupying && isOccupying) {
      return this.setAvailability(mission, {
        truck: TruckStatus.EN_MISSION,
        driver: DriverStatus.EN_MISSION,
      });
    }
    if (wasOccupying && !isOccupying) {
      return this.setAvailability(mission, {
        truck: TruckStatus.DISPO,
        driver: DriverStatus.ACTIF,
      });
    }
    return [];
  }

  private setAvailability(
    mission: Mission,
    to: { truck: TruckStatus; driver: DriverStatus },
  ): Prisma.PrismaPromise<unknown>[] {
    const updates: Prisma.PrismaPromise<unknown>[] = [];
    if (mission.truckId) {
      updates.push(
        this.prisma.truck.update({
          where: { id: mission.truckId },
          data: { status: to.truck },
        }),
      );
    }
    if (mission.driverId) {
      updates.push(
        this.prisma.driver.update({
          where: { id: mission.driverId },
          data: { status: to.driver },
        }),
      );
    }
    return updates;
  }

  private emitTransitionEvents(mission: Mission, newStatus: MissionStatus) {
    if (
      newStatus === MissionStatus.CANCELLED &&
      mission.status !== MissionStatus.CANCELLED &&
      mission.driverId
    ) {
      this.events.emit(
        MissionEvents.CANCELLED,
        new MissionDriverEvent(mission.id, mission.driverId),
      );
    }
  }
}
