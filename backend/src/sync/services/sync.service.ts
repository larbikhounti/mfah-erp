// src/sync/sync.service.ts
import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { SyncRequestDto } from '../dtos/SyncRequest.dto';
import { UploadDataDto } from '../dtos/upload-data.dto';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(private prisma: PrismaService) {}

  async getUpdatedDataForDome(syncRequest: SyncRequestDto) {
    const { domeId, lastSync } = syncRequest;
    let syncLog: {
      id: number;
      domeId: number;
      lastSyncAt: Date;
      wasSuccess: boolean;
    };

    try {
      // Verify the dome exists and is not deleted in central database
      const dome = await this.prisma.doms.findFirst({
        where: {
          id: domeId,
          deletedAt: null,
        },
      });

      if (!dome) {
        throw new Error(
          `Dome with ID ${domeId} not found or deleted in central database`,
        );
      }

      // Log this data request from the dome
      syncLog = await this.prisma.domeSyncLog.create({
        data: {
          domeId,
          lastSyncAt: lastSync,
          wasSuccess: false, // Will update to true if successful
        },
      });

      // Fetch global data from central database (available to all domes)
      const [gameTypes, machineTypes, roles, coupons, comments] =
        await Promise.all([
          this.prisma.gameTypes.findMany({
            where: {
              updatedAt: { gt: lastSync },
              deletedAt: null,
            },
          }),
          this.prisma.machineTypes.findMany({
            where: {
              updatedAt: { gt: lastSync },
              deletedAt: null,
            },
          }),
          this.prisma.roles.findMany({
            where: {
              updatedAt: { gt: lastSync },
              deletedAt: null,
            },
          }),
          this.prisma.coupons.findMany({
            where: {
              updatedAt: { gt: lastSync },
              deletedAt: null,
            },
          }),
          this.prisma.comments.findMany({
            where: {
              updatedAt: { gt: lastSync },
              deletedAt: null,
            },
          }),
        ]);

      // Fetch dome-specific data from central database
      const [doms, machines, users, domeGames] = await Promise.all([
        this.prisma.doms.findMany({
          where: {
            id: domeId,
            updatedAt: { gt: lastSync },
            deletedAt: null,
          },
        }),
        this.prisma.machines.findMany({
          where: {
            domeId,
            updatedAt: { gt: lastSync },
            deletedAt: null,
          },
          include: {
            machineTypes: true,
          },
        }),
        this.prisma.users.findMany({
          where: {
            dom_id: domeId,
            updatedAt: { gt: lastSync },
          },
          include: {
            roles: true,
          },
        }),
        this.prisma.games.findMany({
          where: {
            updatedAt: { gt: lastSync },
            domeGames: { some: { domeId } },
            deletedAt: null,
          },
          include: {
            gameTypes: {
              select: { id: true },
            },
            gameMachineTypes: true,
          },
        }),
      ]);

      // Get machine chairs for machines in this dome
      const machineIds = machines.map((machine) => machine.id);
      const machineChairs = await this.prisma.machineChairs.findMany({
        where: {
          machineId: { in: machineIds },
          updatedAt: { gt: lastSync },
          deletedAt: null,
        },
      });

      // Prepare response
      const response = {
        globalData: {
          gameTypes,
          machineTypes,
          roles,
          coupons,
          comments,
        },
        domeSpecificData: {
          doms,
          machines,
          machineChairs,
          users,
          games: domeGames,
        },
        serverTime: new Date(),
      };

      // Calculate total data count
      const dataCount =
        gameTypes.length +
        machineTypes.length +
        roles.length +
        coupons.length +
        comments.length +
        doms.length +
        machines.length +
        machineChairs.length +
        users.length +
        domeGames.length;

      // Update sync log with success
      await this.prisma.domeSyncLog.update({
        where: { id: syncLog.id },
        data: {
          wasSuccess: true,
          dataCount,
        },
      });

      this.logger.log(
        `Central server successfully provided data to dome ${domeId}. Returned ${dataCount} records.`,
      );

      return response;
    } catch (error) {
      this.logger.error(`Sync failed for dome ${domeId}: ${error.message}`);

      // Update sync log with error if it was created
      if (syncLog) {
        await this.prisma.domeSyncLog.update({
          where: { id: syncLog.id },
          data: {
            wasSuccess: false,
            error: error.message,
          },
        });
      }

      throw error;
    }
  }

  async uploadData(uploadData: UploadDataDto) {
    const { domId, experiences, tickets } = uploadData;

    try {
      // Verify the dome exists
      const dome = await this.prisma.doms.findFirst({
        where: {
          id: domId,
          deletedAt: null,
        },
      });

      if (!dome) {
        throw new Error(`Dome with ID ${domId} not found or deleted`);
      }

      // Use a transaction to ensure all data is saved atomically
      const result = await this.prisma.$transaction(async (prisma) => {
        // Upsert experiences
        const savedExperiences = await Promise.all(
          experiences.map((experience) =>
            prisma.experiences.upsert({
              where: { id: experience.id },
              update: {
                machineId: experience.machineId,
                gameId: experience.gameId,
                isFractioned: experience.isFractioned,
                isNext: experience.isNext,
                isStarted: experience.isStarted,
                isEnded: experience.isEnded,
                startedAt: experience.startedAt,
                endedAt: experience.endedAt,
                updatedAt: experience.updatedAt,
                deletedAt: experience.deletedAt,
                domeId: experience.domeId,
              },
              create: {
                id: experience.id,
                machineId: experience.machineId,
                gameId: experience.gameId,
                isFractioned: experience.isFractioned,
                isNext: experience.isNext,
                isStarted: experience.isStarted,
                isEnded: experience.isEnded,
                startedAt: experience.startedAt,
                endedAt: experience.endedAt,
                createdAt: experience.createdAt,
                updatedAt: experience.updatedAt,
                deletedAt: experience.deletedAt,
                domeId: experience.domeId,
              },
            }),
          ),
        );

        // Upsert tickets
        const savedTickets = await Promise.all(
          tickets.map(async (ticket) => {
            const savedTicket = await prisma.tickets.upsert({
              where: { id: ticket.id },
              update: {
                userId: ticket.userId,
                experienceId: ticket.experienceId,
                alias: ticket.alias,
                isPaid: ticket.isPaid,
                chairId: ticket.chairId,
                couponId: ticket.couponId,
                notes: ticket.notes,
                paidWith: ticket.paidWith,
                price: ticket.price,
                updatedAt: ticket.updatedAt,
                deletedAt: ticket.deletedAt,
                domeId: ticket.domeId,
                parentTicketId: ticket.parentTicketId,
              },
              create: {
                id: ticket.id,
                userId: ticket.userId,
                experienceId: ticket.experienceId,
                alias: ticket.alias,
                isPaid: ticket.isPaid,
                chairId: ticket.chairId,
                couponId: ticket.couponId,
                notes: ticket.notes,
                paidWith: ticket.paidWith,
                price: ticket.price,
                createdAt: ticket.createdAt,
                updatedAt: ticket.updatedAt,
                deletedAt: ticket.deletedAt,
                domeId: ticket.domeId,
                parentTicketId: ticket.parentTicketId,
              },
            });

            // Upsert ticket comments (many-to-many relationship)
            if (ticket.ticketComments && ticket.ticketComments.length > 0) {
              await Promise.all(
                ticket.ticketComments.map((ticketComment) =>
                  prisma.ticketComments.upsert({
                    where: { id: ticketComment.id },
                    update: {
                      ticketId: ticketComment.ticketId,
                      commentId: ticketComment.commentId,
                      updatedAt: ticketComment.updatedAt,
                    },
                    create: {
                      id: ticketComment.id,
                      ticketId: ticketComment.ticketId,
                      commentId: ticketComment.commentId,
                      createdAt: ticketComment.createdAt,
                      updatedAt: ticketComment.updatedAt,
                    },
                  }),
                ),
              );
            }

            return savedTicket;
          }),
        );

        return {
          experiencesCount: savedExperiences.length,
          ticketsCount: savedTickets.length,
        };
      });

      this.logger.log(
        `Successfully uploaded data for dome ${domId}: ${result.experiencesCount} experiences, ${result.ticketsCount} tickets`,
      );

      return {
        success: true,
        message: 'Data uploaded successfully',
        data: {
          domId,
          experiencesProcessed: result.experiencesCount,
          ticketsProcessed: result.ticketsCount,
        },
      };
    } catch (error) {
      this.logger.error(
        `Upload failed for dome ${domId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // // Optional: Get sync history for a dome
  // async getSyncHistory(domeId: number, limit: number = 10) {
  //   return this.prisma.domeSyncLog.findMany({
  //     where: { domeId },
  //     orderBy: { syncedAt: 'desc' },
  //     take: limit,
  //   });
  // }
}
