import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FilterExperiencesDto } from '../dtos/filter-experiences.dto';
import { ExperienceResponse } from '../types/experience-response.type';

@Injectable()
export class ExperiencesService {
  private readonly logger = new Logger(ExperiencesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(filterParams: FilterExperiencesDto): Promise<{
    data: ExperienceResponse[];
    total: number;
  }> {
    try {
      const {
        offset = 0,
        limit = 25,
        search,
        experienceId,
        machineId,
        gameId,
        domeId,
        startDate,
        endDate,
      } = filterParams;

      // Build where clause
      const where: any = {
        deletedAt: null,
      };

      if (experienceId) {
        where.id = experienceId;
      }

      if (machineId) {
        where.machineId = machineId;
      }

      if (gameId) {
        where.gameId = gameId;
      }

      if (domeId) {
        where.domeId = domeId;
      }

      // Date range filtering
      if (startDate || endDate) {
        where.createdAt = {};

        if (startDate) {
          where.createdAt.gte = new Date(startDate);
        }

        if (endDate) {
          // If endDate is provided without time, set it to end of day
          const endDateObj = new Date(endDate);
          if (endDate.length === 10) {
            // YYYY-MM-DD format
            endDateObj.setHours(23, 59, 59, 999);
          }
          where.createdAt.lte = endDateObj;
        }
      }

      if (search && search.trim()) {
        where.OR = [
          {
            machines: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            games: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
          {
            doms: {
              name: {
                contains: search,
                mode: 'insensitive',
              },
            },
          },
        ];
      }

      // Execute queries in parallel
      const [experiences, total] = await Promise.all([
        this.prisma.experiences.findMany({
          where,
          skip: offset,
          take: limit,
          include: {
            machines: {
              include: {
                machineTypes: true,
                machineChairs: {
                  include: {
                    tickets: {
                      where: {
                        deletedAt: null,
                      },
                    },
                  },
                },
              },
            },
            games: {
              include: {
                gameTypes: true,
                machineTypes: true,
              },
            },
            doms: true,
            tickets: {
              where: {
                deletedAt: null,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.experiences.count({ where }),
      ]);

      // Transform the data to match the required format
      const formattedData: ExperienceResponse[] = experiences.map(
        (experience) => {
          // Calculate ticket summary
          const tickets = experience.tickets || [];
          const paidTickets = tickets.filter((t) => t.isPaid);
          const unpaidTickets = tickets.filter((t) => !t.isPaid);
          const gamePrice = experience.games?.price || 0;
          const totalRevenue = paidTickets.length * gamePrice;
          const averagePrice = gamePrice;

          // Get recent tickets (last 5)
          const recentTickets = tickets
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, 5)
            .map((ticket) => ({
              id: ticket.id,
              isPaid: ticket.isPaid,
              chairId: ticket.chairId,
              createdAt: ticket.createdAt.toISOString(),
            }));

          const ticketSummary = {
            totalCount: tickets.length,
            paidCount: paidTickets.length,
            unpaidCount: unpaidTickets.length,
            totalRevenue,
            averagePrice,
            recentTickets,
          };

          return {
            id: experience.id,
            machineId: experience.machineId,
            machine: experience.machines?.name || 'Unknown Machine',
            gameId: experience.gameId,
            game: experience.games?.name || 'Unknown Game',
            domeId: experience.domeId,
            dome: experience.doms?.name || 'Unknown DOM',
            createdAt: experience.createdAt.toISOString(),
            updatedAt: experience.updatedAt.toISOString(),
            // Extended information
            machineType:
              experience.machines?.machineTypes?.name || 'Unknown Type',
            machineChairs:
              experience.machines?.machineChairs?.map((chair) => ({
                id: chair.id,
                name: chair.name,
                status: chair.status,
                ticketCount: chair.tickets?.length || 0,
                tickets:
                  chair.tickets?.map((ticket) => ({
                    id: ticket.id,
                    isPaid: ticket.isPaid,
                    chairId: chair.id,
                    createdAt: ticket.createdAt.toISOString(),
                  })) || [],
              })) || [],
            gamePrice: experience.games?.price || 0,
            gamePlayTime: experience.games?.playTime || 0,
            gameType: experience.games?.gameTypes?.name || 'Unknown Game Type',
            requiredMachineType:
              experience.games?.machineTypes?.name || 'Unknown Required Type',
            domeAddress: experience.doms?.address || 'Unknown Address',
            ticketCount: tickets.length,
            ticketSummary,
          };
        },
      );

      return {
        data: formattedData,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching experiences:', error);
      throw new HttpException(
        'Error fetching experiences',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getExperienceById(id: number): Promise<ExperienceResponse> {
    try {
      const experience = await this.prisma.experiences.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          machines: {
            include: {
              machineTypes: true,
              machineChairs: {
                include: {
                  tickets: {
                    where: {
                      deletedAt: null,
                    },
                  },
                },
              },
            },
          },
          games: {
            include: {
              gameTypes: true,
              machineTypes: true,
            },
          },
          doms: true,
          tickets: {
            where: {
              deletedAt: null,
            },
          },
        },
      });

      if (!experience) {
        throw new HttpException('Experience not found', HttpStatus.NOT_FOUND);
      }

      const tickets = experience.tickets || [];
      const paidTickets = tickets.filter((t) => t.isPaid);
      const unpaidTickets = tickets.filter((t) => !t.isPaid);
      const gamePrice = experience.games?.price || 0;
      const totalRevenue = paidTickets.length * gamePrice;
      const averagePrice = gamePrice;

      // Get recent tickets (last 5)
      const recentTickets = tickets
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 5)
        .map((ticket) => ({
          id: ticket.id,
          isPaid: ticket.isPaid,
          chairId: ticket.chairId,
          createdAt: ticket.createdAt.toISOString(),
        }));

      const ticketSummary = {
        totalCount: tickets.length,
        paidCount: paidTickets.length,
        unpaidCount: unpaidTickets.length,
        totalRevenue,
        averagePrice,
        recentTickets,
      };

      return {
        id: experience.id,
        machineId: experience.machineId,
        machine: experience.machines?.name || 'Unknown Machine',
        gameId: experience.gameId,
        game: experience.games?.name || 'Unknown Game',
        domeId: experience.domeId,
        dome: experience.doms?.name || 'Unknown DOM',
        createdAt: experience.createdAt.toISOString(),
        updatedAt: experience.updatedAt.toISOString(),
        // Extended information
        machineType: experience.machines?.machineTypes?.name || 'Unknown Type',
        machineChairs:
          experience.machines?.machineChairs?.map((chair) => ({
            id: chair.id,
            name: chair.name,
            status: chair.status,
            ticketCount: chair.tickets?.length || 0,
            tickets:
              chair.tickets?.map((ticket) => ({
                id: ticket.id,
                isPaid: ticket.isPaid,
                chairId: chair.id,
                createdAt: ticket.createdAt.toISOString(),
              })) || [],
          })) || [],
        gamePrice: experience.games?.price || 0,
        gamePlayTime: experience.games?.playTime || 0,
        gameType: experience.games?.gameTypes?.name || 'Unknown Game Type',
        requiredMachineType:
          experience.games?.machineTypes?.name || 'Unknown Required Type',
        domeAddress: experience.doms?.address || 'Unknown Address',
        ticketCount: tickets.length,
        ticketSummary,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error fetching experience by ID:', error);
      throw new HttpException(
        'Error fetching experience',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
