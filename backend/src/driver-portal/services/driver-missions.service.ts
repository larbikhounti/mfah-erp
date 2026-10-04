import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AttachmentCategory,
  ExecutionMode,
  MissionStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AttachmentsService,
  UploadedFileInput,
} from '../../attachments/services/attachments.service';
import { MissionLifecycleService } from '../../missions/services/mission-lifecycle.service';
import { FuelEntriesService } from '../../fuel-entries/services/fuel-entries.service';
import { HOME_RECENT_COMPLETED_LIMIT } from '../driver-portal.constants';
import {
  FilterDriverMissionsDto,
  MissionBucket,
} from '../dtos/filter-driver-missions.dto';
import {
  DriverFile,
  DriverMission,
  DriverMissionDetail,
  DriverMissionsOverview,
} from '../types/driver-mission.type';
import {
  MissionWithTruck,
  toDriverFile,
  toDriverMission,
  TRUCK_SUMMARY,
} from './driver-portal.mapper';

/** Which statuses each tab of the driver app shows, and in what order. */
const BUCKETS: Record<
  MissionBucket,
  {
    statuses: MissionStatus[];
    orderBy: Prisma.MissionOrderByWithRelationInput[];
  }
> = {
  active: {
    statuses: [MissionStatus.IN_PROGRESS],
    orderBy: [{ missionDate: 'asc' }],
  },
  upcoming: {
    statuses: [MissionStatus.PLANNED],
    orderBy: [{ missionDate: 'asc' }],
  },
  completed: {
    statuses: [MissionStatus.PENDING_REVIEW, MissionStatus.FINISHED],
    orderBy: [{ completedAt: 'desc' }, { missionDate: 'desc' }],
  },
};

/**
 * The driver's own missions and the actions they can take on them. Every
 * query is scoped to the logged-in driver; another driver's mission is a
 * plain 404, never a 403, so mission ids can't be probed.
 */
@Injectable()
export class DriverMissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly lifecycle: MissionLifecycleService,
    private readonly attachments: AttachmentsService,
    private readonly fuelEntries: FuelEntriesService,
  ) {}

  async overview(driverId: number): Promise<DriverMissionsOverview> {
    const [counts, active, upcoming, recentCompleted] = await Promise.all([
      this.counts(driverId),
      this.listBucket(driverId, 'active', 0, 50),
      this.listBucket(driverId, 'upcoming', 0, 50),
      this.listBucket(driverId, 'completed', 0, HOME_RECENT_COMPLETED_LIMIT),
    ]);
    return { counts, active, upcoming, recentCompleted };
  }

  async list(
    driverId: number,
    filter: FilterDriverMissionsDto,
  ): Promise<{ data: DriverMission[]; total: number }> {
    const { bucket, offset = 0, limit = 20 } = filter;
    const statuses = bucket
      ? BUCKETS[bucket].statuses
      : Object.values(BUCKETS).flatMap((b) => b.statuses);
    const where = this.ownWhere(driverId, { status: { in: statuses } });

    const [missions, total] = await Promise.all([
      this.prisma.mission.findMany({
        where,
        include: TRUCK_SUMMARY,
        orderBy: bucket ? BUCKETS[bucket].orderBy : [{ missionDate: 'desc' }],
        skip: offset,
        take: limit,
      }),
      this.prisma.mission.count({ where }),
    ]);

    return { data: missions.map(toDriverMission), total };
  }

  async detail(
    driverId: number,
    missionId: number,
  ): Promise<DriverMissionDetail> {
    const mission = await this.requireOwnMission(driverId, missionId);
    const fuelWhere = { missionId, driverId };

    const [files, fuelTotals, fuelEntryCount] = await Promise.all([
      this.attachments.findForMission(missionId),
      this.fuelEntries.totals(fuelWhere),
      this.prisma.fuelEntry.count({ where: fuelWhere }),
    ]);

    return {
      ...toDriverMission(mission),
      closureFiles: files.map(toDriverFile),
      fuelTotals,
      fuelEntryCount,
    };
  }

  /** "Confirm loading": the truck is loaded and on its way. */
  async confirmLoading(
    driverId: number,
    missionId: number,
  ): Promise<DriverMissionDetail> {
    await this.requireOwnMission(driverId, missionId);

    const alreadyOnTheRoad = await this.prisma.mission.findFirst({
      where: this.ownWhere(driverId, {
        status: MissionStatus.IN_PROGRESS,
        id: { not: missionId },
      }),
      select: { reference: true },
    });
    if (alreadyOnTheRoad) {
      throw new ConflictException(
        `Finish mission ${alreadyOnTheRoad.reference} before starting a new one`,
      );
    }

    await this.lifecycle.transition(missionId, MissionStatus.IN_PROGRESS, {
      allowedFrom: [MissionStatus.PLANNED],
    });
    return this.detail(driverId, missionId);
  }

  async uploadClosureFile(
    driverId: number,
    missionId: number,
    category: AttachmentCategory,
    file: UploadedFileInput,
  ): Promise<DriverFile> {
    const mission = await this.requireOwnMission(driverId, missionId);
    this.assertInProgress(mission.status);

    const label =
      category === AttachmentCategory.CMR ? 'Signed CMR' : 'Odometer photo';
    const attachment = await this.attachments.uploadForMission(
      missionId,
      label,
      file,
      category,
    );
    return toDriverFile(attachment);
  }

  async deleteClosureFile(
    driverId: number,
    missionId: number,
    attachmentId: number,
  ): Promise<{ message: string }> {
    const mission = await this.requireOwnMission(driverId, missionId);
    this.assertInProgress(mission.status);

    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, missionId },
    });
    if (!attachment) {
      throw new NotFoundException('File not found');
    }
    return this.attachments.remove(attachment.id);
  }

  /** "Complete mission": hand the delivery over to ops for review. */
  async complete(
    driverId: number,
    missionId: number,
    comment?: string,
  ): Promise<DriverMissionDetail> {
    const mission = await this.requireOwnMission(driverId, missionId);
    this.assertInProgress(mission.status);

    const cmrCount = await this.prisma.attachment.count({
      where: { missionId, category: AttachmentCategory.CMR },
    });
    if (cmrCount === 0) {
      throw new BadRequestException(
        'Upload the signed CMR before completing the mission',
      );
    }

    await this.lifecycle.transition(missionId, MissionStatus.PENDING_REVIEW, {
      allowedFrom: [MissionStatus.IN_PROGRESS],
      extraData: { completionComment: comment?.trim() || null },
    });
    return this.detail(driverId, missionId);
  }

  /** The driver's mission, or 404 — shared with the fuel and files services. */
  async requireOwnMission(
    driverId: number,
    missionId: number,
  ): Promise<MissionWithTruck> {
    const mission = await this.prisma.mission.findFirst({
      where: this.ownWhere(driverId, { id: missionId }),
      include: TRUCK_SUMMARY,
    });
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }
    return mission;
  }

  assertInProgress(status: MissionStatus): void {
    if (status !== MissionStatus.IN_PROGRESS) {
      throw new ConflictException(
        status === MissionStatus.PLANNED
          ? 'Confirm loading first'
          : 'This mission is closed and can no longer be changed',
      );
    }
  }

  private async counts(driverId: number) {
    const [active, upcoming, completed] = await Promise.all(
      (['active', 'upcoming', 'completed'] as const).map((bucket) =>
        this.prisma.mission.count({
          where: this.ownWhere(driverId, {
            status: { in: BUCKETS[bucket].statuses },
          }),
        }),
      ),
    );
    return { active, upcoming, completed };
  }

  private async listBucket(
    driverId: number,
    bucket: MissionBucket,
    offset: number,
    limit: number,
  ): Promise<DriverMission[]> {
    const { data } = await this.list(driverId, { bucket, offset, limit });
    return data;
  }

  private ownWhere(
    driverId: number,
    extra: Prisma.MissionWhereInput,
  ): Prisma.MissionWhereInput {
    return {
      driverId,
      executionMode: ExecutionMode.IN_HOUSE,
      deletedAt: null,
      ...extra,
    };
  }
}
