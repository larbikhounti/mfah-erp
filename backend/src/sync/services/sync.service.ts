// src/sync/sync.service.ts
import { PrismaService } from '@app/prisma/prisma.service';
import { Injectable, Logger } from '@nestjs/common';
import { SyncRequestDto } from '../dtos/SyncRequest.dto';

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
      const [gameTypes, machineTypes, roles, coupons] = await Promise.all([
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
            machineTypes: {
              select: { id: true },
            },
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

  // // Optional: Get sync history for a dome
  // async getSyncHistory(domeId: number, limit: number = 10) {
  //   return this.prisma.domeSyncLog.findMany({
  //     where: { domeId },
  //     orderBy: { syncedAt: 'desc' },
  //     take: limit,
  //   });
  // }
}
