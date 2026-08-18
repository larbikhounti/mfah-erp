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
var DomsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DomsService = DomsService_1 = class DomsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(DomsService_1.name);
    }
    async create(data) {
        try {
            const existingDom = await this.prisma.doms.findUnique({
                where: { name: data.name },
            });
            if (existingDom) {
                throw new common_1.HttpException('DOM with this name already exists', common_1.HttpStatus.CONFLICT);
            }
            const dom = await this.prisma.doms.create({
                data: Object.assign(Object.assign({}, data), { createdAt: new Date(), updatedAt: new Date() }),
                include: {
                    _count: {
                        select: {
                            Users: true,
                            experiences: true,
                            machines: true,
                            tickets: true,
                        },
                    },
                },
            });
            return dom;
        }
        catch (error) {
            this.logger.error('Error creating DOM:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error creating DOM', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 10, search, domId, showArchived } = filterParams;
            const where = {};
            if (!showArchived) {
                where.deletedAt = null;
            }
            else {
                where.deletedAt = { not: null };
            }
            if (search) {
                where.OR = [
                    { name: { contains: search, mode: 'insensitive' } },
                    { address: { contains: search, mode: 'insensitive' } },
                ];
            }
            if (domId) {
                where.id = domId;
            }
            const [doms, total] = await Promise.all([
                this.prisma.doms.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    include: {
                        _count: {
                            select: {
                                Users: true,
                                experiences: true,
                                machines: true,
                                tickets: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.doms.count({ where }),
            ]);
            return { data: doms, total };
        }
        catch (error) {
            this.logger.error('Error finding DOMs:', error);
            throw new common_1.HttpException('Error retrieving DOMs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const dom = await this.prisma.doms.findUnique({
                where: { id },
                include: {
                    Users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    experiences: {
                        select: {
                            id: true,
                            machineId: true,
                            gameId: true,
                        },
                    },
                    machines: {
                        select: {
                            id: true,
                            name: true,
                            machineTypeId: true,
                        },
                    },
                    _count: {
                        select: {
                            Users: true,
                            experiences: true,
                            machines: true,
                            tickets: true,
                        },
                    },
                },
            });
            if (!dom) {
                throw new common_1.HttpException('DOM not found', common_1.HttpStatus.NOT_FOUND);
            }
            return dom;
        }
        catch (error) {
            this.logger.error('Error finding DOM by id:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error retrieving DOM', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, data) {
        try {
            const existingDom = await this.prisma.doms.findUnique({
                where: { id },
            });
            if (!existingDom) {
                throw new common_1.HttpException('DOM not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (data.name && data.name !== existingDom.name) {
                const nameExists = await this.prisma.doms.findUnique({
                    where: { name: data.name },
                });
                if (nameExists) {
                    throw new common_1.HttpException('DOM with this name already exists', common_1.HttpStatus.CONFLICT);
                }
            }
            const dom = await this.prisma.doms.update({
                where: { id },
                data: Object.assign(Object.assign({}, data), { updatedAt: new Date() }),
                include: {
                    _count: {
                        select: {
                            Users: true,
                            experiences: true,
                            machines: true,
                            tickets: true,
                        },
                    },
                },
            });
            return dom;
        }
        catch (error) {
            this.logger.error('Error updating DOM:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error updating DOM', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            const existingDom = await this.prisma.doms.findUnique({
                where: { id },
            });
            if (!existingDom) {
                throw new common_1.HttpException('DOM not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (existingDom.deletedAt) {
                throw new common_1.HttpException('DOM is already deleted', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.doms.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
            return { message: 'DOM deleted successfully' };
        }
        catch (error) {
            this.logger.error('Error deleting DOM:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error deleting DOM', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkDelete(bulkDeleteDto) {
        try {
            const { domIds } = bulkDeleteDto;
            const existingDoms = await this.prisma.doms.findMany({
                where: { id: { in: domIds } },
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            const existingDomIds = existingDoms.map((dom) => dom.id);
            const notFoundIds = domIds.filter((id) => !existingDomIds.includes(id));
            const alreadyDeletedDoms = existingDoms.filter((dom) => dom.deletedAt !== null);
            const alreadyDeletedIds = alreadyDeletedDoms.map((dom) => dom.id);
            const deletableIds = existingDomIds.filter((id) => !alreadyDeletedIds.includes(id));
            const deleteResult = await this.prisma.doms.updateMany({
                where: { id: { in: deletableIds } },
                data: { deletedAt: new Date() },
            });
            return {
                message: `Bulk delete completed. ${deleteResult.count} DOMs deleted successfully.`,
                deletedCount: deleteResult.count,
                notFound: notFoundIds,
                alreadyDeleted: alreadyDeletedIds,
            };
        }
        catch (error) {
            this.logger.error('Error bulk deleting DOMs:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error bulk deleting DOMs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async restore(id) {
        try {
            const dom = await this.prisma.doms.findUnique({
                where: { id },
            });
            if (!dom) {
                throw new common_1.HttpException('DOM not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!dom.deletedAt) {
                throw new common_1.HttpException('DOM is not deleted', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.doms.update({
                where: { id },
                data: { deletedAt: null },
            });
            return { message: 'DOM restored successfully' };
        }
        catch (error) {
            this.logger.error('Error restoring DOM:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error restoring DOM', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkRestore(domIds) {
        try {
            const existingDoms = await this.prisma.doms.findMany({
                where: { id: { in: domIds } },
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            const existingDomIds = existingDoms.map((dom) => dom.id);
            const notFoundIds = domIds.filter((id) => !existingDomIds.includes(id));
            const notDeletedDoms = existingDoms.filter((dom) => dom.deletedAt === null);
            const notDeletedIds = notDeletedDoms.map((dom) => dom.id);
            const restorableIds = existingDomIds.filter((id) => !notDeletedIds.includes(id));
            const restoreResult = await this.prisma.doms.updateMany({
                where: { id: { in: restorableIds } },
                data: { deletedAt: null },
            });
            return {
                message: `Bulk restore completed. ${restoreResult.count} DOMs restored successfully.`,
                restoredCount: restoreResult.count,
                notFound: notFoundIds,
                notDeleted: notDeletedIds,
            };
        }
        catch (error) {
            this.logger.error('Error bulk restoring DOMs:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error bulk restoring DOMs', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.DomsService = DomsService;
exports.DomsService = DomsService = DomsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DomsService);
//# sourceMappingURL=doms.service.js.map