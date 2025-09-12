"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GamesService = class GamesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createGameDto) {
        if (createGameDto.gameTypeId) {
            const gameType = await this.prisma.gameTypes.findFirst({
                where: {
                    id: createGameDto.gameTypeId,
                    deletedAt: null,
                },
            });
            if (!gameType) {
                throw new common_1.NotFoundException(`Game type with ID ${createGameDto.gameTypeId} not found`);
            }
        }
        if (createGameDto.machineTypeId) {
            const machineType = await this.prisma.machineTypes.findFirst({
                where: {
                    id: createGameDto.machineTypeId,
                    deletedAt: null,
                },
            });
            if (!machineType) {
                throw new common_1.NotFoundException(`Machine type with ID ${createGameDto.machineTypeId} not found`);
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
    async findAll(filterDto = {}) {
        const { page = 1, limit = 10 } = filterDto, filters = __rest(filterDto, ["page", "limit"]);
        const skip = (page - 1) * limit;
        const where = {
            deletedAt: null,
        };
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
        if (filters.minPlayTime !== undefined ||
            filters.maxPlayTime !== undefined) {
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Game with ID ${id} not found`);
        }
        return this.mapToGameResponse(game);
    }
    async update(id, updateGameDto) {
        const existingGame = await this.prisma.games.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!existingGame) {
            throw new common_1.NotFoundException(`Game with ID ${id} not found`);
        }
        if (updateGameDto.gameTypeId) {
            const gameType = await this.prisma.gameTypes.findFirst({
                where: {
                    id: updateGameDto.gameTypeId,
                    deletedAt: null,
                },
            });
            if (!gameType) {
                throw new common_1.NotFoundException(`Game type with ID ${updateGameDto.gameTypeId} not found`);
            }
        }
        if (updateGameDto.machineTypeId) {
            const machineType = await this.prisma.machineTypes.findFirst({
                where: {
                    id: updateGameDto.machineTypeId,
                    deletedAt: null,
                },
            });
            if (!machineType) {
                throw new common_1.NotFoundException(`Machine type with ID ${updateGameDto.machineTypeId} not found`);
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
    async remove(id) {
        const game = await this.prisma.games.findFirst({
            where: {
                id,
                deletedAt: null,
            },
        });
        if (!game) {
            throw new common_1.NotFoundException(`Game with ID ${id} not found`);
        }
        const activeExperiences = await this.prisma.experiences.count({
            where: {
                gameId: id,
                deletedAt: null,
            },
        });
        if (activeExperiences > 0) {
            throw new common_1.ConflictException(`Cannot delete game with ID ${id} because it has ${activeExperiences} active experiences`);
        }
        await this.prisma.games.update({
            where: { id },
            data: {
                deletedAt: new Date(),
            },
        });
        return { message: `Game with ID ${id} has been successfully deleted` };
    }
    async bulkDelete(bulkDeleteDto) {
        const { ids } = bulkDeleteDto;
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
            throw new common_1.NotFoundException(`Games with IDs ${nonExistingIds.join(', ')} not found`);
        }
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
            throw new common_1.ConflictException(`Cannot delete games because they have active experiences: ${gameNames}`);
        }
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
    mapToGameResponse(game) {
        var _a;
        return {
            id: game.id,
            name: game.name,
            price: game.price,
            playTime: game.playTime,
            age: game.age,
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
            experiencesCount: ((_a = game._count) === null || _a === void 0 ? void 0 : _a.experiences) || 0,
        };
    }
};
exports.GamesService = GamesService;
exports.GamesService = GamesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GamesService);
//# sourceMappingURL=games.service.js.map