import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateGameTypeDto } from '../dtos/create-game-type.dto';
import { UpdateGameTypeDto } from '../dtos/update-game-type.dto';
import { BulkDeleteGameTypesDto } from '../dtos/bulk-delete-game-types.dto';
import { FilterGameTypesDto } from '../dtos/filter/filter-game-types.dto';
import { GameTypeResponse } from '../types/game-type-response.type';

@Injectable()
export class GameTypesService {
  private readonly logger = new Logger(GameTypesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    filterParams: FilterGameTypesDto,
  ): Promise<{ data: GameTypeResponse[]; total: number }> {
    try {
      const {
        offset = 0,
        limit = 10,
        search,
        status,
        gameTypeId,
        showArchived,
      } = filterParams;

      // Build the where clause based on filter parameters
            const where: any = {
        
      };

      if (!showArchived) {
        where.deletedAt = null;
      }else {
        where.deletedAt = { not: null };
      }

      if (search) {
        where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
      }

      if (gameTypeId) {
        where.id = gameTypeId;
      }

      // Execute queries in parallel
      const [gameTypes, total] = await Promise.all([
        this.prisma.gameTypes.findMany({
          where,
          skip: offset,
          take: limit,
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
            _count: {
              select: {
                games: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.gameTypes.count({ where }),
      ]);

      // Transform the data to match the required format
      const formattedData: GameTypeResponse[] = gameTypes.map((gameType) => ({
        id: gameType.id,
        name: gameType.name,
        gamesCount: gameType._count.games,
        createdAt: gameType.createdAt.toISOString(),
        updatedAt: gameType.updatedAt.toISOString(),
        deletedAt: gameType.deletedAt?.toISOString() || null,
      }));

      return {
        data: formattedData,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching game types:', error);
      throw new HttpException(
        'Error fetching game types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async createGameTypeByAdmin(
    data: CreateGameTypeDto,
  ): Promise<GameTypeResponse> {
    try {
      // Check if game type with this name already exists
      const existingGameType = await this.prisma.gameTypes.findFirst({
        where: {
          name: data.name,
          deletedAt: null,
        },
      });

      if (existingGameType) {
        throw new HttpException(
          'Game type with this name already exists',
          HttpStatus.CONFLICT,
        );
      }

      const gameType = await this.prisma.gameTypes.create({
        data: {
          name: data.name,
        },
        include: {
          _count: {
            select: {
              games: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return {
        id: gameType.id,
        name: gameType.name,
        gamesCount: gameType._count.games,
        createdAt: gameType.createdAt.toISOString(),
        updatedAt: gameType.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error creating game type:', error);
      throw new HttpException(
        'Error creating game type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getGameTypeById(id: number): Promise<GameTypeResponse> {
    try {
      const gameType = await this.prisma.gameTypes.findFirst({
        where: {
          id,
          deletedAt: null,
        },
        include: {
          _count: {
            select: {
              games: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      if (!gameType) {
        throw new HttpException('Game type not found', HttpStatus.NOT_FOUND);
      }

      return {
        id: gameType.id,
        name: gameType.name,
        gamesCount: gameType._count.games,
        createdAt: gameType.createdAt.toISOString(),
        updatedAt: gameType.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error fetching game type:', error);
      throw new HttpException(
        'Error fetching game type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateGameTypeByAdmin(
    id: number,
    data: UpdateGameTypeDto,
  ): Promise<GameTypeResponse> {
    try {
      // Check if game type exists
      const existingGameType = await this.prisma.gameTypes.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!existingGameType) {
        throw new HttpException('Game type not found', HttpStatus.NOT_FOUND);
      }

      // Check if name is being updated and if it conflicts with existing game type
      if (data.name && data.name !== existingGameType.name) {
        const nameConflict = await this.prisma.gameTypes.findFirst({
          where: {
            name: data.name,
            deletedAt: null,
            NOT: {
              id: id,
            },
          },
        });

        if (nameConflict) {
          throw new HttpException(
            'Game type name already taken by another game type',
            HttpStatus.CONFLICT,
          );
        }
      }

      const gameType = await this.prisma.gameTypes.update({
        where: { id },
        data: {
          ...(data.name && { name: data.name }),
        },
        include: {
          _count: {
            select: {
              games: {
                where: {
                  deletedAt: null,
                },
              },
            },
          },
        },
      });

      return {
        id: gameType.id,
        name: gameType.name,
        gamesCount: gameType._count.games,
        createdAt: gameType.createdAt.toISOString(),
        updatedAt: gameType.updatedAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error updating game type:', error);
      throw new HttpException(
        'Error updating game type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteGameTypeByAdmin(id: number): Promise<{ message: string }> {
    try {
      const gameType = await this.prisma.gameTypes.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!gameType) {
        throw new HttpException('Game type not found', HttpStatus.NOT_FOUND);
      }

      // Soft delete the game type
      await this.prisma.gameTypes.update({
        where: { id },
        data: {
          deletedAt: new Date(),
        },
      });

      return { message: 'Game type deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error deleting game type:', error);
      throw new HttpException(
        'Error deleting game type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDeleteGameTypesByAdmin(data: BulkDeleteGameTypesDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
  }> {
    try {
      const { gameTypeIds } = data;

      // Find existing game types
      const existingGameTypes = await this.prisma.gameTypes.findMany({
        where: {
          id: {
            in: gameTypeIds,
          },
          deletedAt: null,
        },
        select: {
          id: true,
        },
      });

      const existingIds = existingGameTypes.map((gameType) => gameType.id);
      const notFound = gameTypeIds.filter((id) => !existingIds.includes(id));

      if (existingIds.length === 0) {
        throw new HttpException(
          'No game types found with the provided IDs',
          HttpStatus.NOT_FOUND,
        );
      }

      // Soft delete existing game types
      await this.prisma.gameTypes.updateMany({
        where: {
          id: {
            in: existingIds,
          },
        },
        data: {
          deletedAt: new Date(),
        },
      });

      return {
        message: `${existingIds.length} game type(s) deleted successfully`,
        deletedCount: existingIds.length,
        notFound,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Error bulk deleting game types:', error);
      throw new HttpException(
        'Error bulk deleting game types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restore(id: number): Promise<{ message: string }> {
    try {
      const gameType = await this.prisma.gameTypes.findUnique({
        where: { id },
      });

      if (!gameType) {
        throw new HttpException('Game type not found', HttpStatus.NOT_FOUND);
      }

      if (!gameType.deletedAt) {
        throw new HttpException(
          'Game type is not deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.gameTypes.update({
        where: { id },
        data: { deletedAt: null },
      });

      return { message: 'Game type restored successfully' };
    } catch (error) {
      this.logger.error(`Error restoring game type with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error restoring game type',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkRestore(gameTypeIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    try {
      const existingGameTypes = await this.prisma.gameTypes.findMany({
        where: { id: { in: gameTypeIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingGameTypeIds = existingGameTypes.map((gt) => gt.id);
      const notFoundIds = gameTypeIds.filter(
        (id) => !existingGameTypeIds.includes(id),
      );

      const notDeletedGameTypes = existingGameTypes.filter(
        (gt) => gt.deletedAt === null,
      );
      const notDeletedIds = notDeletedGameTypes.map((gt) => gt.id);

      const restorableIds = existingGameTypeIds.filter(
        (id) => !notDeletedIds.includes(id),
      );

      const restoreResult = await this.prisma.gameTypes.updateMany({
        where: { id: { in: restorableIds } },
        data: { deletedAt: null },
      });

      return {
        message: `Bulk restore completed. ${restoreResult.count} game types restored successfully.`,
        restoredCount: restoreResult.count,
        notFound: notFoundIds,
        notDeleted: notDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error bulk restoring game types:', error);
      throw new HttpException(
        'Error bulk restoring game types',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
