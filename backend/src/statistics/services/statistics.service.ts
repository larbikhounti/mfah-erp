import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  DomStatistics,
  MachineStatistics,
} from '../types/statistics-response.type';

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

  async getMachineStatisticsByDom(
    domId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<MachineStatistics[]> {
    const isAllDoms = domId === 'all';
    const domIdNumber = isAllDoms ? null : parseInt(domId, 10);

    // Default to today if no dates provided
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Start of today

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999); // End of today

    // Build date range filter for tickets (not experiences)
    const ticketDateFilter: any = {
      deletedAt: null,
      isPaid: true,
    };

    // Use provided dates or default to today
    ticketDateFilter.createdAt = {
      gte: startDate ? new Date(startDate) : today,
      lte: endDate ? new Date(endDate) : endOfToday,
    };

    // Build the where clause for machines
    const machineWhereClause = isAllDoms
      ? { deletedAt: null }
      : { deletedAt: null, domeId: domIdNumber };

    // Get all machines for the specified DOM(s)
    const machines = await this.prisma.machines.findMany({
      where: machineWhereClause,
      include: {
        doms: {
          select: {
            name: true,
          },
        },
        experiences: {
          where: {
            deletedAt: null,
          },
          include: {
            tickets: {
              where: ticketDateFilter,
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
            },
          },
        },
      },
    });

    // Map machines to statistics
    const machineStats: MachineStatistics[] = machines.map((machine) => {
      // Only count experiences that have tickets in the date range
      const experiencesWithTickets = machine.experiences.filter(
        (exp) => exp.tickets.length > 0,
      );
      const experiencesCount = experiencesWithTickets.length;

      // Calculate total revenue from tickets in the date range
      let totalRevenue = 0;
      let ticketCount = 0;
      machine.experiences.forEach((experience) => {
        experience.tickets.forEach((ticket) => {
          ticketCount++;
          // Use ticket price if available, otherwise calculate from game price
          let price = ticket.price ?? ticket.experiences.games?.price ?? 0;

          // Apply coupon discount if exists
          if (ticket.coupons) {
            const discountAmount = (price * ticket.coupons.discount) / 100;
            price = price - discountAmount;
          }

          totalRevenue += price;
        });
      });

      console.log(
        `Machine: ${machine.name}, Experiences: ${machine.experiences.length}, ` +
          `Exp with tickets: ${experiencesCount}, Tickets: ${ticketCount}, Revenue: ${totalRevenue}`,
      );

      return {
        id: machine.id,
        name: machine.name,
        alias: machine.alias,
        domName: machine.doms?.name || 'Unassigned',
        experiencesCount,
        totalRevenue: Math.round(totalRevenue * 100) / 100, // Round to 2 decimals
      };
    });

    // Sort by total revenue descending
    return machineStats.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}
