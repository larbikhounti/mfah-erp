import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { DomStatistics } from '../types/statistics-response.type';

@Injectable()
export class StatisticsService {
  constructor(private prisma: PrismaService) {}

  async getStatisticsByDom(
    domId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<DomStatistics> {
    const isAllDoms = domId === 'all';
    const domIdNumber = isAllDoms ? null : parseInt(domId, 10);

    // Build date range filter
    const dateFilter: any = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) {
        dateFilter.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.createdAt.lte = new Date(endDate);
      }
    }

    // Build the where clause for filtering by DOM
    const whereClause = isAllDoms
      ? { deletedAt: null, ...dateFilter }
      : { deletedAt: null, domeId: domIdNumber, ...dateFilter };

    // Get total experiences (parent experiences only, fractioned counted as one)
    // An experience is a parent if it doesn't have a parentId (if you have such field)
    // or we count unique experiences excluding child/fractioned ones
    const totalExperiences = await this.prisma.experiences.count({
      where: whereClause,
    });

    // Get fractioned experiences count
    const fractionedExperiences = await this.prisma.experiences.count({
      where: {
        ...whereClause,
        isFractioned: true,
      },
    });

    // Build ticket where clause (with date filter)
    const ticketWhereClause = isAllDoms
      ? { deletedAt: null, ...dateFilter }
      : { deletedAt: null, domeId: domIdNumber, ...dateFilter };

    // Get sold tickets count (paid tickets)
    const soldTickets = await this.prisma.tickets.count({
      where: {
        ...ticketWhereClause,
        isPaid: true,
      },
    });

    // Get unsold tickets count (unpaid tickets)
    const unsoldTickets = await this.prisma.tickets.count({
      where: {
        ...ticketWhereClause,
        isPaid: false,
      },
    });

    // Calculate money made (sum of paid ticket prices with coupon discounts)
    const paidTickets = await this.prisma.tickets.findMany({
      where: {
        ...ticketWhereClause,
        isPaid: true,
      },
      include: {
        experiences: {
          include: {
            games: {
              select: {
                price: true,
              },
            },
          },
        },
        coupons: {
          select: {
            discount: true,
          },
        },
      },
    });

    const moneyMade = paidTickets.reduce((sum, ticket) => {
      // Use ticket price if available, otherwise calculate from game price
      let price = ticket.price ?? ticket.experiences.games?.price ?? 0;

      // Apply coupon discount if exists
      if (ticket.coupons) {
        const discountAmount = (price * ticket.coupons.discount) / 100;
        price = price - discountAmount;
      }

      return sum + price;
    }, 0);

    // Calculate potential revenue (sum of unpaid ticket prices with coupon discounts)
    const unpaidTickets = await this.prisma.tickets.findMany({
      where: {
        ...ticketWhereClause,
        isPaid: false,
      },
      include: {
        experiences: {
          include: {
            games: {
              select: {
                price: true,
              },
            },
          },
        },
        coupons: {
          select: {
            discount: true,
          },
        },
      },
    });

    const potentialRevenue = unpaidTickets.reduce((sum, ticket) => {
      // Use ticket price if available, otherwise calculate from game price
      let price = ticket.price ?? ticket.experiences.games?.price ?? 0;

      // Apply coupon discount if exists
      if (ticket.coupons) {
        const discountAmount = (price * ticket.coupons.discount) / 100;
        price = price - discountAmount;
      }

      return sum + price;
    }, 0);

    // Get DOM name if specific DOM
    let domName: string | undefined;
    if (!isAllDoms && domIdNumber) {
      const dom = await this.prisma.doms.findUnique({
        where: { id: domIdNumber },
        select: { name: true },
      });
      domName = dom?.name;
    } else {
      domName = 'All DOMs';
    }

    return {
      totalExperiences,
      fractionedExperiences,
      soldTickets,
      unsoldTickets,
      moneyMade: Math.round(moneyMade * 100) / 100, // Round to 2 decimals
      potentialRevenue: Math.round(potentialRevenue * 100) / 100,
      domId: isAllDoms ? undefined : domIdNumber,
      domName,
    };
  }
}
