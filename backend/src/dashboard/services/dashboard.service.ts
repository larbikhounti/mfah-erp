import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  Currency,
  DriverStatus,
  InvoiceStatus,
  MissionStatus,
  TruckStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { DashboardSummaryQueryDto } from '../dtos/dashboard-summary-query.dto';
import {
  CurrencyBreakdown,
  DashboardSummaryResponse,
  MissionSummaryRow,
} from '../types/dashboard-summary.type';

const emptyBreakdown = (): CurrencyBreakdown => ({ MAD: 0, EUR: 0 });

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getSummary(
    query: DashboardSummaryQueryDto,
  ): Promise<DashboardSummaryResponse> {
    try {
      const { startDate, endDate, offset = 0, limit = 10 } = query;

      // Mission-period aggregates (revenue, pipeline, the table) are scoped
      // to this date range. Fleet/driver status and overdue counts are
      // deliberately NOT date-scoped — they're a live snapshot of "right
      // now", not a historical figure for the period.
      const missionWhere: any = { deletedAt: null };
      if (startDate || endDate) {
        missionWhere.missionDate = {};
        if (startDate) missionWhere.missionDate.gte = startDate;
        if (endDate) missionWhere.missionDate.lte = endDate;
      }

      const [
        missionTotal,
        missionsByStatusRaw,
        clientInvoiceSums,
        subcontractorBillSums,
        fleetStatusRaw,
        driverStatusRaw,
        overdueClientInvoices,
        overdueSubcontractorBills,
        missions,
      ] = await Promise.all([
        this.prisma.mission.count({ where: missionWhere }),
        this.prisma.mission.groupBy({
          by: ['status'],
          where: missionWhere,
          _count: true,
        }),
        this.prisma.clientInvoice.groupBy({
          by: ['currency'],
          where: { deletedAt: null, mission: missionWhere },
          _sum: { amount: true, amountPaid: true },
        }),
        this.prisma.subcontractorBill.groupBy({
          by: ['currency'],
          where: { deletedAt: null, mission: missionWhere },
          _sum: { amount: true, amountPaid: true },
        }),
        this.prisma.truck.groupBy({
          by: ['status'],
          where: { deletedAt: null },
          _count: true,
        }),
        this.prisma.driver.groupBy({
          by: ['status'],
          where: { deletedAt: null },
          _count: true,
        }),
        this.prisma.clientInvoice.count({
          where: {
            deletedAt: null,
            status: { not: InvoiceStatus.PAID },
            dueDate: { lt: new Date() },
          },
        }),
        this.prisma.subcontractorBill.count({
          where: {
            deletedAt: null,
            status: { not: InvoiceStatus.PAID },
            dueDate: { lt: new Date() },
          },
        }),
        this.prisma.mission.findMany({
          where: missionWhere,
          skip: offset,
          take: limit,
          orderBy: { missionDate: 'desc' },
          include: {
            client: { select: { companyName: true } },
            clientInvoice: { select: { status: true } },
            subcontractorBill: { select: { status: true } },
          },
        }),
      ]);

      return {
        missionTotal,
        missionsByStatus: this.fillStatusCounts(
          missionsByStatusRaw,
          MissionStatus,
        ),
        revenue: this.sumByCurrency(clientInvoiceSums, 'amount'),
        outstanding: this.outstandingByCurrency(clientInvoiceSums),
        subcontractorSpend: this.sumByCurrency(subcontractorBillSums, 'amount'),
        subcontractorOutstanding: this.outstandingByCurrency(
          subcontractorBillSums,
        ),
        fleetStatus: this.fillStatusCounts(fleetStatusRaw, TruckStatus),
        driverStatus: this.fillStatusCounts(driverStatusRaw, DriverStatus),
        overdueClientInvoices,
        overdueSubcontractorBills,
        missions: {
          data: missions.map(
            (m): MissionSummaryRow => ({
              id: m.id,
              reference: m.reference,
              clientId: m.clientId,
              clientName: m.client.companyName,
              transportType: m.transportType,
              executionMode: m.executionMode,
              status: m.status,
              clientPrice: m.clientPrice.toString(),
              currency: m.currency,
              missionDate: m.missionDate,
              clientInvoiceStatus: m.clientInvoice?.status ?? null,
              subcontractorBillStatus: m.subcontractorBill?.status ?? null,
            }),
          ),
          total: missionTotal,
        },
      };
    } catch (error) {
      this.logger.error('Error building dashboard summary:', error);
      throw new HttpException(
        'Error building dashboard summary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private fillStatusCounts<T extends string>(
    rows: { status: T; _count: number }[],
    enumObject: Record<string, T>,
  ): Record<T, number> {
    const result = Object.values(enumObject).reduce(
      (acc, value) => ({ ...acc, [value]: 0 }),
      {} as Record<T, number>,
    );

    for (const row of rows) {
      result[row.status] = row._count;
    }

    return result;
  }

  private sumByCurrency(
    rows: { currency: Currency; _sum: { amount: any; amountPaid: any } }[],
    field: 'amount',
  ): CurrencyBreakdown {
    const result = emptyBreakdown();
    for (const row of rows) {
      result[row.currency] = Number(row._sum[field] ?? 0);
    }
    return result;
  }

  private outstandingByCurrency(
    rows: { currency: Currency; _sum: { amount: any; amountPaid: any } }[],
  ): CurrencyBreakdown {
    const result = emptyBreakdown();
    for (const row of rows) {
      const amount = Number(row._sum.amount ?? 0);
      const amountPaid = Number(row._sum.amountPaid ?? 0);
      result[row.currency] = amount - amountPaid;
    }
    return result;
  }
}
