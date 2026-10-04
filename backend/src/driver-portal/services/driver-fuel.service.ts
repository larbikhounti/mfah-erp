import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UploadedFileInput } from '../../attachments/services/attachments.service';
import { FuelEntriesService } from '../../fuel-entries/services/fuel-entries.service';
import { CreateFuelEntryDto } from '../../fuel-entries/dtos/create-fuel-entry.dto';
import { FuelTotals } from '../../fuel-entries/types/fuel-entry-response.type';
import { FilterDriverFuelDto } from '../dtos/filter-driver-fuel.dto';
import { DriverFuelEntry } from '../types/driver-mission.type';
import { DriverMissionsService } from './driver-missions.service';
import { toDriverFuelEntry } from './driver-portal.mapper';

/** Fuel entries from the driver's side: only their own, only while on the road. */
@Injectable()
export class DriverFuelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fuelEntries: FuelEntriesService,
    private readonly missions: DriverMissionsService,
  ) {}

  async list(
    driverId: number,
    filter: FilterDriverFuelDto,
  ): Promise<{ data: DriverFuelEntry[]; total: number; totals: FuelTotals }> {
    const { data, total, totals } = await this.fuelEntries.findAll({
      driverId,
      missionId: filter.missionId,
      offset: filter.offset,
      limit: filter.limit,
    });

    const references = await this.missionReferences(
      data.map((e) => e.missionId),
    );
    return {
      data: data.map((e) =>
        toDriverFuelEntry(e, references.get(e.missionId) ?? ''),
      ),
      total,
      totals,
    };
  }

  async add(
    driverId: number,
    missionId: number,
    dto: CreateFuelEntryDto,
    receipt?: UploadedFileInput,
  ): Promise<DriverFuelEntry> {
    const mission = await this.missions.requireOwnMission(driverId, missionId);
    this.missions.assertInProgress(mission.status);

    const entry = await this.fuelEntries.create(
      { missionId, driverId, truckId: mission.truckId },
      dto,
      receipt,
    );
    return toDriverFuelEntry(entry, mission.reference);
  }

  async remove(
    driverId: number,
    entryId: number,
  ): Promise<{ message: string }> {
    const entry = await this.prisma.fuelEntry.findFirst({
      where: { id: entryId, driverId },
      include: { mission: { select: { status: true } } },
    });
    if (!entry) {
      throw new NotFoundException('Fuel entry not found');
    }
    this.missions.assertInProgress(entry.mission.status);
    return this.fuelEntries.remove(entryId);
  }

  private async missionReferences(ids: number[]): Promise<Map<number, string>> {
    const missions = await this.prisma.mission.findMany({
      where: { id: { in: [...new Set(ids)] } },
      select: { id: true, reference: true },
    });
    return new Map(missions.map((m) => [m.id, m.reference]));
  }
}
