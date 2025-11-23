import {
  Injectable,
  NotFoundException,
  ConflictException,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateGameDto,
  UpdateGameDto,
  FilterGamesDto,
  BulkDeleteGamesDto,
} from '../dtos';
import { GameResponse, PaginatedGamesResponse } from '../types';

@Injectable()
export class GamesService {
  private readonly logger = new Logger(GamesService.name);

  constructor(private prisma: PrismaService) {}

  async create(createGameDto: CreateGameDto): Promise<GameResponse> {
    // Check if game type exists if provided
    if (createGameDto.gameTypeId) {
      const gameType = await this.prisma.gameTypes.findFirst({
        where: {
          id: createGameDto.gameTypeId,
          deletedAt: null,
        },
      });
      if (!gameType) {
        throw new NotFoundException(
          `Game type with ID ${createGameDto.gameTypeId} not found`,
        );
      }
    }

    // Check if machine types exist if provided
    if (
      createGameDto.machineTypeIds &&
      createGameDto.machineTypeIds.length > 0
    ) {
      const machineTypes = await this.prisma.machineTypes.findMany({
        where: {
          id: { in: createGameDto.machineTypeIds },
          deletedAt: null,
        },
      });
      if (machineTypes.length !== createGameDto.machineTypeIds.length) {
        const foundIds = machineTypes.map((mt) => mt.id);
        const notFoundIds = createGameDto.machineTypeIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(
          `Machine types with IDs ${notFoundIds.join(', ')} not found`,
        );
      }
    }

    const game = await this.prisma.games.create({
      data: {
        gameTypeId: createGameDto.gameTypeId,
        name: createGameDto.name,
        price: createGameDto.price,
        playTime: createGameDto.playTime,
        age: createGameDto.age,
        isFavored: createGameDto.isFavored || false,
      },
      include: {
        gameTypes: true,
        gameMachineTypes: {
          include: {
            machineTypes: true,
          },
        },
        _count: {
          select: {
            experiences: true,
          },
        },
      },
    });

    // Create gameMachineTypes relations
    if (
      createGameDto.machineTypeIds &&
      createGameDto.machineTypeIds.length > 0
    ) {
      const gameMachineTypes = createGameDto.machineTypeIds.map(
        (machineTypeId) => ({
          gameId: game.id,
          machineTypeId,
        }),
      );
      await this.prisma.gameMachineTypes.createMany({
        data: gameMachineTypes,
      });
    }

    // Create domeGames relations
    if (createGameDto.domeId && createGameDto.domeId.length > 0) {
      const domeGames = createGameDto.domeId.map((domeId) => ({
        domeId,
        gameId: game.id,
      }));
      await this.prisma.domeGames.createMany({
        data: domeGames,
      });
    }

    return this.mapToGameResponse(game);
  }

  async findAll(
    filterDto: FilterGamesDto = {},
  ): Promise<PaginatedGamesResponse> {
    const { page = 1, limit = 10, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: filters.showArchived ? { not: null } : null,
    };


    // Apply filters
    if (filters.name) {
      where.name = {
        contains: filters.name,
        mode: 'insensitive',
      };
    }

    if (filters.gameTypeId) {
      where.gameTypeId = filters.gameTypeId;
    }

    if (filters.machineTypeIds && filters.machineTypeIds.length > 0) {
      where.gameMachineTypes = {
        some: {
          machineTypeId: { in: filters.machineTypeIds },
        },
      };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }

    if (
      filters.minPlayTime !== undefined ||
      filters.maxPlayTime !== undefined
    ) {
      where.playTime = {};
      if (filters.minPlayTime !== undefined) {
        where.playTime.gte = filters.minPlayTime;
      }
      if (filters.maxPlayTime !== undefined) {
        where.playTime.lte = filters.maxPlayTime;
      }
    }

    if (filters.isFavored !== undefined) {
      where.isFavored = filters.isFavored;
    }

    const [games, total] = await Promise.all([
      this.prisma.games.findMany({
        where,
        skip,
        take: limit,
        include: {
          gameTypes: true,
          gameMachineTypes: {
            include: {
              machineTypes: true,
            },
          },
          domeGames: {
            where: {
              deletedAt: null,
            },
            include: {
              doms: true,
            },
          },
          _count: {
            select: {
              experiences: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.games.count({ where }),
    ]);

    const mappedGames = games.map((game) => this.mapToGameResponse(game));

    return {
      games: mappedGames,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number): Promise<GameResponse> {
    const game = await this.prisma.games.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        gameTypes: true,
        gameMachineTypes: {
          include: {
            machineTypes: true,
          },
        },
        domeGames: {
          where: {
            deletedAt: null,
          },
          include: {
            doms: true,
          },
        },
        _count: {
          select: {
            experiences: true,
          },
        },
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    return this.mapToGameResponse(game);
  }

  async update(
    id: number,
    updateGameDto: UpdateGameDto,
  ): Promise<GameResponse> {
    // Check if game exists
    const existingGame = await this.prisma.games.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingGame) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    // Check if game type exists if provided
    if (updateGameDto.gameTypeId) {
      const gameType = await this.prisma.gameTypes.findFirst({
        where: {
          id: updateGameDto.gameTypeId,
          deletedAt: null,
        },
      });
      if (!gameType) {
        throw new NotFoundException(
          `Game type with ID ${updateGameDto.gameTypeId} not found`,
        );
      }
    }

    // Check if machine types exist if provided
    if (
      updateGameDto.machineTypeIds &&
      updateGameDto.machineTypeIds.length > 0
    ) {
      const machineTypes = await this.prisma.machineTypes.findMany({
        where: {
          id: { in: updateGameDto.machineTypeIds },
          deletedAt: null,
        },
      });
      if (machineTypes.length !== updateGameDto.machineTypeIds.length) {
        const foundIds = machineTypes.map((mt) => mt.id);
        const notFoundIds = updateGameDto.machineTypeIds.filter(
          (id) => !foundIds.includes(id),
        );
        throw new NotFoundException(
          `Machine types with IDs ${notFoundIds.join(', ')} not found`,
        );
      }
    }

    const updatedGame = await this.prisma.games.update({
      where: { id },
      data: {
        gameTypeId: updateGameDto.gameTypeId,
        name: updateGameDto.name,
        price: updateGameDto.price,
        playTime: updateGameDto.playTime,
        age: updateGameDto.age,
        ...(updateGameDto.isFavored !== undefined && {
          isFavored: updateGameDto.isFavored,
        }),
      },
      include: {
        gameTypes: true,
        gameMachineTypes: {
          include: {
            machineTypes: true,
          },
        },
        _count: {
          select: {
            experiences: true,
          },
        },
      },
    });

    // Update gameMachineTypes relations if provided
    if (updateGameDto.machineTypeIds !== undefined) {
      // Delete existing relations
      await this.prisma.gameMachineTypes.deleteMany({
        where: { gameId: id },
      });

      // Create new relations if any
      if (updateGameDto.machineTypeIds.length > 0) {
        const gameMachineTypes = updateGameDto.machineTypeIds.map(
          (machineTypeId) => ({
            gameId: id,
            machineTypeId,
          }),
        );
        await this.prisma.gameMachineTypes.createMany({
          data: gameMachineTypes,
        });
      }
    }

    await this.prisma.domeGames.deleteMany({
      where: { gameId: id },
    });

    // Recreate domeGames relations
    if (updateGameDto.domeId && updateGameDto.domeId.length > 0) {
      const domeGames = updateGameDto.domeId.map((domeId) => ({
        domeId,
        gameId: updatedGame.id,
      }));
      await this.prisma.domeGames.createMany({
        data: domeGames,
      });
    }

    return this.mapToGameResponse(updatedGame);
  }

  async remove(id: number): Promise<{ message: string }> {
    const game = await this.prisma.games.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!game) {
      throw new NotFoundException(`Game with ID ${id} not found`);
    }

    // Check if game has active experiences
    const activeExperiences = await this.prisma.experiences.count({
      where: {
        gameId: id,
        deletedAt: null,
      },
    });

   // if (activeExperiences > 0) {
     // throw new ConflictException(
       // `Cannot delete game with ID ${id} because it has ${activeExperiences} active experiences`,
      //);
   // }

    // Soft delete
    await this.prisma.games.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: `Game with ID ${id} has been successfully deleted` };
  }

  async bulkDelete(
    bulkDeleteDto: BulkDeleteGamesDto,
  ): Promise<{ message: string; deletedCount: number }> {
    const { ids } = bulkDeleteDto;

    // Check if all games exist
    const existingGames = await this.prisma.games.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      select: { id: true },
    });

    const existingIds = existingGames.map((game) => game.id);
    const nonExistingIds = ids.filter((id) => !existingIds.includes(id));

    if (nonExistingIds.length > 0) {
      throw new NotFoundException(
        `Games with IDs ${nonExistingIds.join(', ')} not found`,
      );
    }

    // Check if any games have active experiences
    const gamesWithExperiences = await this.prisma.games.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
        experiences: {
          some: {
            deletedAt: null,
          },
        },
      },
      select: { id: true, name: true },
    });

    if (gamesWithExperiences.length > 0) {
      const gameNames = gamesWithExperiences
        .map((g) => `${g.name} (ID: ${g.id})`)
        .join(', ');
      throw new ConflictException(
        `Cannot delete games because they have active experiences: ${gameNames}`,
      );
    }

    // Perform bulk soft delete
    const result = await this.prisma.games.updateMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: `Successfully deleted ${result.count} games`,
      deletedCount: result.count,
    };
  }

  async restore(id: number): Promise<{ message: string }> {
    try {
      const game = await this.prisma.games.findUnique({
        where: { id },
      });

      if (!game) {
        throw new ConflictException('Game not found');
      }

      if (!game.deletedAt) {
        throw new ConflictException('Game is not deleted');
      }

      await this.prisma.games.update({
        where: { id },
        data: { deletedAt: null },
      });

      return { message: 'Game restored successfully' };
    } catch (error) {
      this.logger.error(`Error restoring game with id ${id}:`, error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new ConflictException('Error restoring game');
    }
  }

  async bulkRestore(gameIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    try {
      const existingGames = await this.prisma.games.findMany({
        where: { id: { in: gameIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingGameIds = existingGames.map((game) => game.id);
      const notFoundIds = gameIds.filter((id) => !existingGameIds.includes(id));

      // Filter out games that are not deleted
      const notDeletedGames = existingGames.filter((game) => game.deletedAt === null);
      const notDeletedIds = notDeletedGames.map((game) => game.id);

      const restorableIds = existingGameIds.filter(
        (id) => !notDeletedIds.includes(id),
      );

      // Restore games
      const restoreResult = await this.prisma.games.updateMany({
        where: { id: { in: restorableIds } },
        data: { deletedAt: null },
      });

      return {
        message: `Bulk restore completed. ${restoreResult.count} games restored successfully.`,
        restoredCount: restoreResult.count,
        notFound: notFoundIds,
        notDeleted: notDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error bulk restoring games:', error);
      throw new ConflictException('Error bulk restoring games');
    }
  }

  private mapToGameResponse(game: any): GameResponse {
    return {
      id: game.id,
      name: game.name,
      price: game.price,
      playTime: game.playTime,
      age: game.age,
      gameTypeId: game.gameTypeId,
      isFavored: game.isFavored || false,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      deletedAt: game.deletedAt,
      gameType: game.gameTypes
        ? {
            id: game.gameTypes.id,
            name: game.gameTypes.name,
          }
        : null,
      machineTypes: game.gameMachineTypes
        ? game.gameMachineTypes.map((gmt: any) => ({
            id: gmt.machineTypes.id,
            name: gmt.machineTypes.name,
          }))
        : [],
      experiencesCount: game._count?.experiences || 0,
      domes: game.domeGames
        ? game.domeGames.map((domeGame: any) => ({
            id: domeGame.doms.id,
            name: domeGame.doms.name,
          }))
        : [],
    };
  }
}
