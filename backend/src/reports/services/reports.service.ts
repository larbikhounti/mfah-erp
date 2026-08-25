import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ReportsQueryDto } from '../dtos/reports-query.dto';
import {
  CurrencyBreakdown,
  DriverReportRow,
  TruckReportRow,
} from '../types/reports.type';

const emptyBreakdown = (): CurrencyBreakdown => ({ MAD: 0, EUR: 0 });

// Pure read/aggregation over Mission + Driver/Truck + ClientInvoice — no
// writes, no models of its own. Same shape as DashboardService, but built as
// its own re-runnable report per date range rather than a "right now" view.
@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private readonly prisma: PrismaService) {}

  private baseMissionWhere(query: ReportsQueryDto) {
    const { startDate, endDate, clientId } = query;
    const where: any = { deletedAt: null };
    if (startDate || endDate) {
      where.missionDate = {};
      if (startDate) where.missionDate.gte = startDate;
      if (endDate) where.missionDate.lte = endDate;
    }
    if (clientId) where.clientId = clientId;
    return where;
  }

  async getDriverReport(query: ReportsQueryDto): Promise<DriverReportRow[]> {
    try {
      const missionWhere = {
        ...this.baseMissionWhere(query),
        driverId: { not: null },
      };

      const [drivers, counts] = await Promise.all([
        this.prisma.driver.findMany({
          where: { deletedAt: null },
          select: { id: true, fullName: true },
          orderBy: { fullName: 'asc' },
        }),
        this.prisma.mission.groupBy({
          by: ['driverId'],
          where: missionWhere,
          _count: true,
        }),
      ]);

      const countMap = new Map<number, number>();
      for (const row of counts) {
        if (row.driverId != null) countMap.set(row.driverId, row._count);
      }

      const rows: DriverReportRow[] = drivers.map((d) => ({
        driverId: d.id,
        driverName: d.fullName,
        missionCount: countMap.get(d.id) ?? 0,
        archived: false,
      }));

      // A driver soft-deleted after the fact can still have missions inside
      // the requested range — surface them rather than losing the count.
      const activeIds = new Set(drivers.map((d) => d.id));
      const orphanIds = counts
        .map((c) => c.driverId)
        .filter((id): id is number => id != null && !activeIds.has(id));

      if (orphanIds.length) {
        const archivedDrivers = await this.prisma.driver.findMany({
          where: { id: { in: orphanIds } },
          select: { id: true, fullName: true },
        });
        for (const d of archivedDrivers) {
          rows.push({
            driverId: d.id,
            driverName: `${d.fullName} (archived)`,
            missionCount: countMap.get(d.id) ?? 0,
            archived: true,
          });
        }
      }

      return rows.sort((a, b) => b.missionCount - a.missionCount);
    } catch (error) {
      this.logger.error('Error building driver report:', error);
      throw new HttpException(
        'Error building driver report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTruckReport(query: ReportsQueryDto): Promise<TruckReportRow[]> {
    try {
      const missionWhere = {
        ...this.baseMissionWhere(query),
        truckId: { not: null },
      };

      const [trucks, counts, invoiceRows] = await Promise.all([
        this.prisma.truck.findMany({
          where: { deletedAt: null },
          select: { id: true, plateNumber: true, type: true },
          orderBy: { plateNumber: 'asc' },
        }),
        this.prisma.mission.groupBy({
          by: ['truckId'],
          where: missionWhere,
          _count: true,
        }),
        // ClientInvoice has no truckId of its own — Prisma can't groupBy a
        // related field, so revenue-by-truck is summed in-memory from the
        // joined rows, same "small post-processing helper" convention as
        // DashboardService's sumByCurrency.
        this.prisma.clientInvoice.findMany({
          where: { deletedAt: null, mission: missionWhere },
          select: {
            amount: true,
            currency: true,
            mission: { select: { truckId: true } },
          },
        }),
      ]);

      const countMap = new Map<number, number>();
      for (const row of counts) {
        if (row.truckId != null) countMap.set(row.truckId, row._count);
      }

      const revenueMap = new Map<number, CurrencyBreakdown>();
      for (const inv of invoiceRows) {
        const truckId = inv.mission.truckId;
        if (truckId == null) continue;
        const current = revenueMap.get(truckId) ?? emptyBreakdown();
        current[inv.currency] += Number(inv.amount);
        revenueMap.set(truckId, current);
      }

      const rows: TruckReportRow[] = trucks.map((t) => ({
        truckId: t.id,
        plateNumber: t.plateNumber,
        truckType: t.type,
        missionCount: countMap.get(t.id) ?? 0,
        revenue: revenueMap.get(t.id) ?? emptyBreakdown(),
        archived: false,
      }));

      const activeIds = new Set(trucks.map((t) => t.id));
      const orphanIds = counts
        .map((c) => c.truckId)
        .filter((id): id is number => id != null && !activeIds.has(id));

      if (orphanIds.length) {
        const archivedTrucks = await this.prisma.truck.findMany({
          where: { id: { in: orphanIds } },
          select: { id: true, plateNumber: true, type: true },
        });
        for (const t of archivedTrucks) {
          rows.push({
            truckId: t.id,
            plateNumber: `${t.plateNumber} (archived)`,
            truckType: t.type,
            missionCount: countMap.get(t.id) ?? 0,
            revenue: revenueMap.get(t.id) ?? emptyBreakdown(),
            archived: true,
          });
        }
      }

      return rows.sort((a, b) => b.missionCount - a.missionCount);
    } catch (error) {
      this.logger.error('Error building truck report:', error);
      throw new HttpException(
        'Error building truck report',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
