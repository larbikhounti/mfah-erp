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
var MachineTypesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineTypesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MachineTypesService = MachineTypesService_1 = class MachineTypesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MachineTypesService_1.name);
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 10, search, machineTypeId, showArchived } = filterParams;
            const where = {};
            if (!showArchived) {
                where.deletedAt = null;
            }
            else {
                where.deletedAt = { not: null };
            }
            if (search) {
                where.name = { contains: search, mode: 'insensitive' };
            }
            if (machineTypeId) {
                where.id = machineTypeId;
            }
            const [machineTypes, total] = await Promise.all([
                this.prisma.machineTypes.findMany({
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
                                machines: {
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
                this.prisma.machineTypes.count({ where }),
            ]);
            const formattedData = machineTypes.map((machineType) => {
                var _a;
                return ({
                    id: machineType.id,
                    name: machineType.name,
                    machinesCount: machineType._count.machines,
                    createdAt: machineType.createdAt.toISOString(),
                    updatedAt: machineType.updatedAt.toISOString(),
                    deletedAt: ((_a = machineType.deletedAt) === null || _a === void 0 ? void 0 : _a.toISOString()) || null,
                });
            });
            return {
                data: formattedData,
                total,
            };
        }
        catch (error) {
            this.logger.error('Error fetching machine types:', error);
            throw new common_1.HttpException('Error fetching machine types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createMachineTypeByAdmin(createMachineTypeDto) {
        try {
            const existingMachineType = await this.prisma.machineTypes.findUnique({
                where: { name: createMachineTypeDto.name },
            });
            if (existingMachineType && !existingMachineType.deletedAt) {
                throw new common_1.HttpException('Machine type with this name already exists', common_1.HttpStatus.CONFLICT);
            }
            if (existingMachineType && existingMachineType.deletedAt) {
                const updatedMachineType = await this.prisma.machineTypes.update({
                    where: { id: existingMachineType.id },
                    data: {
                        deletedAt: null,
                        updatedAt: new Date(),
                    },
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        updatedAt: true,
                        _count: {
                            select: {
                                machines: {
                                    where: {
                                        deletedAt: null,
                                    },
                                },
                            },
                        },
                    },
                });
                return {
                    id: updatedMachineType.id,
                    name: updatedMachineType.name,
                    machinesCount: updatedMachineType._count.machines,
                    createdAt: updatedMachineType.createdAt.toISOString(),
                    updatedAt: updatedMachineType.updatedAt.toISOString(),
                };
            }
            const machineType = await this.prisma.machineTypes.create({
                data: {
                    name: createMachineTypeDto.name,
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            machines: {
                                where: {
                                    deletedAt: null,
                                },
                            },
                        },
                    },
                },
            });
            return {
                id: machineType.id,
                name: machineType.name,
                machinesCount: machineType._count.machines,
                createdAt: machineType.createdAt.toISOString(),
                updatedAt: machineType.updatedAt.toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error creating machine type:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error creating machine type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMachineTypeById(id) {
        try {
            const machineType = await this.prisma.machineTypes.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            machines: {
                                where: {
                                    deletedAt: null,
                                },
                            },
                        },
                    },
                },
            });
            if (!machineType) {
                throw new common_1.HttpException('Machine type not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                id: machineType.id,
                name: machineType.name,
                machinesCount: machineType._count.machines,
                createdAt: machineType.createdAt.toISOString(),
                updatedAt: machineType.updatedAt.toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error fetching machine type by ID:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error fetching machine type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateMachineTypeByAdmin(id, updateMachineTypeDto) {
        try {
            const existingMachineType = await this.prisma.machineTypes.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!existingMachineType) {
                throw new common_1.HttpException('Machine type not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (updateMachineTypeDto.name) {
                const duplicateCheck = await this.prisma.machineTypes.findFirst({
                    where: {
                        name: updateMachineTypeDto.name,
                        id: { not: id },
                        deletedAt: null,
                    },
                });
                if (duplicateCheck) {
                    throw new common_1.HttpException('Machine type with this name already exists', common_1.HttpStatus.CONFLICT);
                }
            }
            const updatedMachineType = await this.prisma.machineTypes.update({
                where: { id },
                data: Object.assign(Object.assign({}, updateMachineTypeDto), { updatedAt: new Date() }),
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            machines: {
                                where: {
                                    deletedAt: null,
                                },
                            },
                        },
                    },
                },
            });
            return {
                id: updatedMachineType.id,
                name: updatedMachineType.name,
                machinesCount: updatedMachineType._count.machines,
                createdAt: updatedMachineType.createdAt.toISOString(),
                updatedAt: updatedMachineType.updatedAt.toISOString(),
            };
        }
        catch (error) {
            this.logger.error('Error updating machine type:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error updating machine type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteMachineTypeByAdmin(id) {
        try {
            const existingMachineType = await this.prisma.machineTypes.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!existingMachineType) {
                throw new common_1.HttpException('Machine type not found', common_1.HttpStatus.NOT_FOUND);
            }
            await this.prisma.machineTypes.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
            return { message: 'Machine type deleted successfully' };
        }
        catch (error) {
            this.logger.error('Error deleting machine type:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error deleting machine type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkDeleteMachineTypesByAdmin(bulkDeleteDto) {
        try {
            const { machineTypeIds } = bulkDeleteDto;
            const existingMachineTypes = await this.prisma.machineTypes.findMany({
                where: {
                    id: { in: machineTypeIds },
                    deletedAt: null,
                },
                select: { id: true },
            });
            const existingIds = existingMachineTypes.map((mt) => mt.id);
            const notFound = machineTypeIds.filter((id) => !existingIds.includes(id));
            if (existingIds.length > 0) {
                await this.prisma.machineTypes.updateMany({
                    where: {
                        id: { in: existingIds },
                    },
                    data: {
                        deletedAt: new Date(),
                    },
                });
            }
            return {
                message: `${existingIds.length} machine types deleted successfully`,
                deletedCount: existingIds.length,
                notFound,
            };
        }
        catch (error) {
            this.logger.error('Error bulk deleting machine types:', error);
            throw new common_1.HttpException('Error bulk deleting machine types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async restore(id) {
        try {
            const machineType = await this.prisma.machineTypes.findUnique({
                where: { id },
            });
            if (!machineType) {
                throw new common_1.HttpException('Machine type not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!machineType.deletedAt) {
                throw new common_1.HttpException('Machine type is not deleted', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.machineTypes.update({
                where: { id },
                data: { deletedAt: null },
            });
            return { message: 'Machine type restored successfully' };
        }
        catch (error) {
            this.logger.error(`Error restoring machine type with id ${id}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error restoring machine type', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkRestore(machineTypeIds) {
        try {
            const existingMachineTypes = await this.prisma.machineTypes.findMany({
                where: { id: { in: machineTypeIds } },
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            const existingMachineTypeIds = existingMachineTypes.map((mt) => mt.id);
            const notFoundIds = machineTypeIds.filter((id) => !existingMachineTypeIds.includes(id));
            const notDeletedMachineTypes = existingMachineTypes.filter((mt) => mt.deletedAt === null);
            const notDeletedIds = notDeletedMachineTypes.map((mt) => mt.id);
            const restorableIds = existingMachineTypeIds.filter((id) => !notDeletedIds.includes(id));
            const restoreResult = await this.prisma.machineTypes.updateMany({
                where: { id: { in: restorableIds } },
                data: { deletedAt: null },
            });
            return {
                message: `Bulk restore completed. ${restoreResult.count} machine types restored successfully.`,
                restoredCount: restoreResult.count,
                notFound: notFoundIds,
                notDeleted: notDeletedIds,
            };
        }
        catch (error) {
            this.logger.error('Error bulk restoring machine types:', error);
            throw new common_1.HttpException('Error bulk restoring machine types', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MachineTypesService = MachineTypesService;
exports.MachineTypesService = MachineTypesService = MachineTypesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachineTypesService);
//# sourceMappingURL=machine-types.service.js.map