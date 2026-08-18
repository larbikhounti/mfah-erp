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
var GameTypesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GameTypesService = GameTypesService_1 = class GameTypesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(GameTypesService_1.name);
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 10, search, status, gameTypeId, showArchived, } = filterParams;
            const where = {};
            if (!showArchived) {
                where.deletedAt = null;
            }
            else {
                where.deletedAt = { not: null };
            }
            if (search) {
                where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
            }
            if (gameTypeId) {
                where.id = gameTypeId;
            }
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
            const formattedData = gameTypes.map((gameType) => {
                var _a;
                return ({
                    id: gameType.id,
                    name: gameType.name,
                    gamesCount: gameType._count.games,
                    createdAt: gameType.createdAt.toISOString(),
                    updatedAt: gameType.updatedAt.toISOString(),
                    deletedAt: ((_a = gameType.deletedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                });
            });
            return {
                data: formattedData,
                total,
            };
        }
        catch (error) {
            this.logger.error('Error fetching game types:', error);
            throw new common_1.HttpException('Error fetching game types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createGameTypeByAdmin(data) {
        try {
            const existingGameType = await this.prisma.gameTypes.findFirst({
                where: {
                    name: data.name,
                    deletedAt: null,
                },
            });
            if (existingGameType) {
                throw new common_1.HttpException('Game type with this name already exists', common_1.HttpStatus.CONFLICT);
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
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error creating game type:', error);
            throw new common_1.HttpException('Error creating game type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getGameTypeById(id) {
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
                throw new common_1.HttpException('Game type not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                id: gameType.id,
                name: gameType.name,
                gamesCount: gameType._count.games,
                createdAt: gameType.createdAt.toISOString(),
                updatedAt: gameType.updatedAt.toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error fetching game type:', error);
            throw new common_1.HttpException('Error fetching game type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateGameTypeByAdmin(id, data) {
        try {
            const existingGameType = await this.prisma.gameTypes.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!existingGameType) {
                throw new common_1.HttpException('Game type not found', common_1.HttpStatus.NOT_FOUND);
            }
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
                    throw new common_1.HttpException('Game type name already taken by another game type', common_1.HttpStatus.CONFLICT);
                }
            }
            const gameType = await this.prisma.gameTypes.update({
                where: { id },
                data: Object.assign({}, (data.name && { name: data.name })),
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
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error updating game type:', error);
            throw new common_1.HttpException('Error updating game type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteGameTypeByAdmin(id) {
        try {
            const gameType = await this.prisma.gameTypes.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!gameType) {
                throw new common_1.HttpException('Game type not found', common_1.HttpStatus.NOT_FOUND);
            }
            await this.prisma.gameTypes.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
            return { message: 'Game type deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error deleting game type:', error);
            throw new common_1.HttpException('Error deleting game type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkDeleteGameTypesByAdmin(data) {
        try {
            const { gameTypeIds } = data;
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
                throw new common_1.HttpException('No game types found with the provided IDs', common_1.HttpStatus.NOT_FOUND);
            }
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
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error bulk deleting game types:', error);
            throw new common_1.HttpException('Error bulk deleting game types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async restore(id) {
        try {
            const gameType = await this.prisma.gameTypes.findUnique({
                where: { id },
            });
            if (!gameType) {
                throw new common_1.HttpException('Game type not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!gameType.deletedAt) {
                throw new common_1.HttpException('Game type is not deleted', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.gameTypes.update({
                where: { id },
                data: { deletedAt: null },
            });
            return { message: 'Game type restored successfully' };
        }
        catch (error) {
            this.logger.error(`Error restoring game type with id ${id}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error restoring game type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkRestore(gameTypeIds) {
        try {
            const existingGameTypes = await this.prisma.gameTypes.findMany({
                where: { id: { in: gameTypeIds } },
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            const existingGameTypeIds = existingGameTypes.map((gt) => gt.id);
            const notFoundIds = gameTypeIds.filter((id) => !existingGameTypeIds.includes(id));
            const notDeletedGameTypes = existingGameTypes.filter((gt) => gt.deletedAt === null);
            const notDeletedIds = notDeletedGameTypes.map((gt) => gt.id);
            const restorableIds = existingGameTypeIds.filter((id) => !notDeletedIds.includes(id));
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
        }
        catch (error) {
            this.logger.error('Error bulk restoring game types:', error);
            throw new common_1.HttpException('Error bulk restoring game types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.GameTypesService = GameTypesService;
exports.GameTypesService = GameTypesService = GameTypesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GameTypesService);
//# sourceMappingURL=game-types.service.js.map