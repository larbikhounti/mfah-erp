import { Injectable, NotFoundException } from '@nestjs/common';
import { Attachment, FuelEntry, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AttachmentsService,
  UploadedFileInput,
} from '../../attachments/services/attachments.service';
import { CreateFuelEntryDto } from '../dtos/create-fuel-entry.dto';
import { FilterFuelEntriesDto } from '../dtos/filter-fuel-entries.dto';
import {
  FuelEntriesWithTotals,
  FuelEntryResponse,
  FuelTotals,
} from '../types/fuel-entry-response.type';

type FuelEntryWithAttachments = FuelEntry & { attachments: Attachment[] };

/**
 * Fuel entries reported by drivers. Holds no rules about *who* may add one
 * or *when* (that's the driver portal's job) — only how entries are stored,
 * totalled, and cleaned up.
 */
@Injectable()
export class FuelEntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attachments: AttachmentsService,
  ) {}

  async create(
    owner: { missionId: number; driverId: number; truckId: number | null },
    dto: CreateFuelEntryDto,
    receipt?: UploadedFileInput,
  ): Promise<FuelEntryResponse> {
    const litres = new Prisma.Decimal(dto.litres);
    const unitPrice = new Prisma.Decimal(dto.unitPrice);

    const entry = await this.prisma.fuelEntry.create({
      data: {
        ...owner,
        litres,
        unitPrice,
        currency: dto.currency,
        totalAmount: litres.times(unitPrice).toDecimalPlaces(2),
        odometerKm: dto.odometerKm,
      },
    });

    const receiptAttachment = receipt
      ? await this.attachments.uploadForFuelEntry(entry.id, receipt)
      : null;

    return { ...entry, receipt: receiptAttachment };
  }

  async findAll(filter: FilterFuelEntriesDto): Promise<FuelEntriesWithTotals> {
    const { missionId, driverId, offset = 0, limit = 50 } = filter;
    const where: Prisma.FuelEntryWhereInput = { missionId, driverId };

    const [entries, total, totals] = await Promise.all([
      this.prisma.fuelEntry.findMany({
        where,
        include: { attachments: true },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
      }),
      this.prisma.fuelEntry.count({ where }),
      this.totals(where),
    ]);

    return { data: entries.map((e) => this.toResponse(e)), total, totals };
  }

  async findOne(id: number): Promise<FuelEntryResponse> {
    const entry = await this.prisma.fuelEntry.findUnique({
      where: { id },
      include: { attachments: true },
    });
    if (!entry) {
      throw new NotFoundException('Fuel entry not found');
    }
    return this.toResponse(entry);
  }

  /** Deletes the entry together with its receipt file on disk. */
  async remove(id: number): Promise<{ message: string }> {
    const entry = await this.findOne(id);
    if (entry.receipt) {
      await this.attachments.remove(entry.receipt.id);
    }
    await this.prisma.fuelEntry.delete({ where: { id } });
    return { message: 'Fuel entry deleted successfully' };
  }

  async totals(where: Prisma.FuelEntryWhereInput): Promise<FuelTotals> {
    const groups = await this.prisma.fuelEntry.groupBy({
      by: ['currency'],
      where,
      _sum: { totalAmount: true, litres: true },
      _count: { _all: true },
    });

    const totals: FuelTotals = {};
    for (const group of groups) {
      totals[group.currency] = {
        amount: (group._sum.totalAmount ?? new Prisma.Decimal(0)).toFixed(2),
        litres: (group._sum.litres ?? new Prisma.Decimal(0)).toFixed(2),
        entries: group._count._all,
      };
    }
    return totals;
  }

  private toResponse(entry: FuelEntryWithAttachments): FuelEntryResponse {
    const { attachments, ...rest } = entry;
    return { ...rest, receipt: attachments[0] ?? null };
  }
}
