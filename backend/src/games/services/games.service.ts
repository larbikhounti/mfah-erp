import {
  Injectable,
  NotFoundException,
  ConflictException,
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

    // Check if machine type exists if provided
    if (createGameDto.machineTypeId) {
      const machineType = await this.prisma.machineTypes.findFirst({
        where: {
          id: createGameDto.machineTypeId,
          deletedAt: null,
        },
      });
      if (!machineType) {
        throw new NotFoundException(
          `Machine type with ID ${createGameDto.machineTypeId} not found`,
        );
      }
    }

    const game = await this.prisma.games.create({
      data: createGameDto,
      include: {
        gameTypes: true,
        machineTypes: true,
        _count: {
          select: {
            experiences: true,
          },
        },
      },
    });

    return this.mapToGameResponse(game);
  }

  async findAll(
    filterDto: FilterGamesDto = {},
  ): Promise<PaginatedGamesResponse> {
    const { page = 1, limit = 10, ...filters } = filterDto;
    const skip = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
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

    if (filters.machineTypeId) {
      where.machineTypeId = filters.machineTypeId;
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

    const [games, total] = await Promise.all([
      this.prisma.games.findMany({
        where,
        skip,
        take: limit,
        include: {
          gameTypes: true,
          machineTypes: true,
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
        machineTypes: true,
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

    // Check if machine type exists if provided
    if (updateGameDto.machineTypeId) {
      const machineType = await this.prisma.machineTypes.findFirst({
        where: {
          id: updateGameDto.machineTypeId,
          deletedAt: null,
        },
      });
      if (!machineType) {
        throw new NotFoundException(
          `Machine type with ID ${updateGameDto.machineTypeId} not found`,
        );
      }
    }

    const updatedGame = await this.prisma.games.update({
      where: { id },
      data: updateGameDto,
      include: {
        gameTypes: true,
        machineTypes: true,
        _count: {
          select: {
            experiences: true,
          },
        },
      },
    });

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

    if (activeExperiences > 0) {
      throw new ConflictException(
        `Cannot delete game with ID ${id} because it has ${activeExperiences} active experiences`,
      );
    }

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

  private mapToGameResponse(game: any): GameResponse {
    return {
      id: game.id,
      name: game.name,
      price: game.price,
      playTime: game.playTime,
      gameTypeId: game.gameTypeId,
      machineTypeId: game.machineTypeId,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
      gameType: game.gameTypes
        ? {
            id: game.gameTypes.id,
            name: game.gameTypes.name,
          }
        : null,
      machineType: game.machineTypes
        ? {
            id: game.machineTypes.id,
            name: game.machineTypes.name,
          }
        : null,
      experiencesCount: game._count?.experiences || 0,
    };
  }
}
