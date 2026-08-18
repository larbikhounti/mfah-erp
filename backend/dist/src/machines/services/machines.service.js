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
var MachinesService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MachinesService = MachinesService_1 = class MachinesService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MachinesService_1.name);
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 10, search, status, machineId, machineTypeId, domeId, showArchived, } = filterParams;
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
            if (machineId) {
                where.id = machineId;
            }
            if (machineTypeId) {
                where.machineTypeId = machineTypeId;
            }
            if (domeId) {
                where.domeId = domeId;
            }
            if (status) {
                where.status = status;
            }
            const [machines, total] = await Promise.all([
                this.prisma.machines.findMany({
                    where,
                    skip: offset,
                    take: limit,
                    select: {
                        id: true,
                        name: true,
                        alias: true,
                        status: true,
                        machineTypeId: true,
                        domeId: true,
                        createdAt: true,
                        updatedAt: true,
                        deletedAt: true,
                        machineTypes: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        doms: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                        machineChairs: {
                            where: {
                                deletedAt: null,
                            },
                            select: {
                                id: true,
                                name: true,
                                status: true,
                            },
                            orderBy: {
                                id: 'asc',
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.machines.count({ where }),
            ]);
            const formattedData = machines.map((machine) => {
                var _a, _b, _c;
                return ({
                    id: machine.id,
                    name: machine.name,
                    alias: machine.alias,
                    status: machine.status,
                    machineTypeId: machine.machineTypeId,
                    machineType: ((_a = machine.machineTypes) === null || _a === void 0 ? void 0 : _a.name) || null,
                    domeId: machine.domeId,
                    dome: ((_b = machine.doms) === null || _b === void 0 ? void 0 : _b.name) || null,
                    chairsCount: machine.machineChairs.length,
                    chairs: machine.machineChairs,
                    createdAt: machine.createdAt.toISOString(),
                    updatedAt: machine.updatedAt.toISOString(),
                    deletedAt: ((_c = machine.deletedAt) === null || _c === void 0 ? void 0 : _c.toISOString()) || null,
                });
            });
            return {
                data: formattedData,
                total,
            };
        }
        catch (error) {
            this.logger.error('Error fetching machines:', error);
            throw new common_1.HttpException('Error fetching machines', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createMachineByAdmin(data) {
        var _a, _b, _c, _d;
        try {
            const existingMachine = await this.prisma.machines.findFirst({
                where: {
                    name: data.name,
                    deletedAt: null,
                },
            });
            if (existingMachine) {
                throw new common_1.HttpException('Machine with this name already exists', common_1.HttpStatus.CONFLICT);
            }
            const existingAlias = await this.prisma.machines.findFirst({
                where: {
                    alias: data.alias,
                    deletedAt: null,
                },
            });
            if (existingAlias) {
                throw new common_1.HttpException('Machine with this alias already exists', common_1.HttpStatus.CONFLICT);
            }
            if (data.machineTypeId) {
                const machineType = await this.prisma.machineTypes.findFirst({
                    where: {
                        id: data.machineTypeId,
                        deletedAt: null,
                    },
                });
                if (!machineType) {
                    throw new common_1.HttpException('Machine type not found', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            if (data.domeId) {
                const dome = await this.prisma.doms.findFirst({
                    where: {
                        id: data.domeId,
                        deletedAt: null,
                    },
                });
                if (!dome) {
                    throw new common_1.HttpException('DOM not found', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const machine = await this.prisma.machines.create({
                data: {
                    name: data.name,
                    alias: data.alias,
                    status: data.status || 'active',
                    machineTypeId: data.machineTypeId,
                    domeId: data.domeId || null,
                },
                include: {
                    machineTypes: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    doms: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    machineChairs: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            id: true,
                            name: true,
                            status: true,
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    },
                },
            });
            if (data.chairsNumber && data.chairsNumber > 0) {
                const chairsToCreate = [];
                for (let i = 1; i <= data.chairsNumber; i++) {
                    chairsToCreate.push({
                        name: `${machine.name} - Chair ${i}`,
                        status: 0,
                        machineId: machine.id,
                    });
                }
                await this.prisma.machineChairs.createMany({
                    data: chairsToCreate,
                });
                const createdChairs = await this.prisma.machineChairs.findMany({
                    where: {
                        machineId: machine.id,
                        deletedAt: null,
                    },
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                    orderBy: {
                        id: 'asc',
                    },
                });
                return {
                    id: machine.id,
                    name: machine.name,
                    alias: machine.alias,
                    status: machine.status,
                    machineTypeId: machine.machineTypeId,
                    machineType: ((_a = machine.machineTypes) === null || _a === void 0 ? void 0 : _a.name) || null,
                    domeId: machine.domeId,
                    dome: ((_b = machine.doms) === null || _b === void 0 ? void 0 : _b.name) || null,
                    chairsCount: createdChairs.length,
                    chairs: createdChairs,
                    createdAt: machine.createdAt.toISOString(),
                    updatedAt: machine.updatedAt.toISOString(),
                };
            }
            return {
                id: machine.id,
                name: machine.name,
                alias: machine.alias,
                status: machine.status,
                machineTypeId: machine.machineTypeId,
                machineType: ((_c = machine.machineTypes) === null || _c === void 0 ? void 0 : _c.name) || null,
                domeId: machine.domeId,
                dome: ((_d = machine.doms) === null || _d === void 0 ? void 0 : _d.name) || null,
                chairsCount: machine.machineChairs.length,
                chairs: machine.machineChairs,
                createdAt: machine.createdAt.toISOString(),
                updatedAt: machine.updatedAt.toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error creating machine:', error);
            throw new common_1.HttpException('Error creating machine', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getMachineById(id) {
        var _a, _b;
        try {
            const machine = await this.prisma.machines.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                include: {
                    machineTypes: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    doms: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    machineChairs: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            id: true,
                            name: true,
                            status: true,
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    },
                },
            });
            if (!machine) {
                throw new common_1.HttpException('Machine not found', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                id: machine.id,
                name: machine.name,
                alias: machine.alias,
                status: machine.status,
                machineTypeId: machine.machineTypeId,
                machineType: ((_a = machine.machineTypes) === null || _a === void 0 ? void 0 : _a.name) || null,
                domeId: machine.domeId,
                dome: ((_b = machine.doms) === null || _b === void 0 ? void 0 : _b.name) || null,
                chairsCount: machine.machineChairs.length,
                chairs: machine.machineChairs,
                createdAt: machine.createdAt.toISOString(),
                updatedAt: machine.updatedAt.toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error fetching machine:', error);
            throw new common_1.HttpException('Error fetching machine', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async updateMachineByAdmin(id, data) {
        var _a, _b;
        try {
            const existingMachine = await this.prisma.machines.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!existingMachine) {
                throw new common_1.HttpException('Machine not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (data.name && data.name !== existingMachine.name) {
                const nameConflict = await this.prisma.machines.findFirst({
                    where: {
                        name: data.name,
                        deletedAt: null,
                        NOT: {
                            id: id,
                        },
                    },
                });
                if (nameConflict) {
                    throw new common_1.HttpException('Machine name already taken by another machine', common_1.HttpStatus.CONFLICT);
                }
            }
            if (data.alias && data.alias !== existingMachine.alias) {
                const aliasConflict = await this.prisma.machines.findFirst({
                    where: {
                        alias: data.alias,
                        deletedAt: null,
                        NOT: {
                            id: id,
                        },
                    },
                });
                if (aliasConflict) {
                    throw new common_1.HttpException('Machine alias already taken by another machine', common_1.HttpStatus.CONFLICT);
                }
            }
            if (data.machineTypeId) {
                const machineType = await this.prisma.machineTypes.findFirst({
                    where: {
                        id: data.machineTypeId,
                        deletedAt: null,
                    },
                });
                if (!machineType) {
                    throw new common_1.HttpException('Machine type not found', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            if (data.domeId) {
                const dome = await this.prisma.doms.findFirst({
                    where: {
                        id: data.domeId,
                        deletedAt: null,
                    },
                });
                if (!dome) {
                    throw new common_1.HttpException('DOM not found', common_1.HttpStatus.BAD_REQUEST);
                }
            }
            const machine = await this.prisma.machines.update({
                where: { id },
                data: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, (data.name && { name: data.name })), (data.alias && { alias: data.alias })), (data.status && { status: data.status })), (data.machineTypeId !== undefined && {
                    machineTypeId: data.machineTypeId,
                })), (data.domeId !== undefined && { domeId: data.domeId })),
                include: {
                    machineTypes: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    doms: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                    machineChairs: {
                        where: {
                            deletedAt: null,
                        },
                        select: {
                            id: true,
                            name: true,
                            status: true,
                        },
                        orderBy: {
                            id: 'asc',
                        },
                    },
                },
            });
            return {
                id: machine.id,
                name: machine.name,
                alias: machine.alias,
                status: machine.status,
                machineTypeId: machine.machineTypeId,
                machineType: ((_a = machine.machineTypes) === null || _a === void 0 ? void 0 : _a.name) || null,
                domeId: machine.domeId,
                dome: ((_b = machine.doms) === null || _b === void 0 ? void 0 : _b.name) || null,
                chairsCount: machine.machineChairs.length,
                chairs: machine.machineChairs,
                createdAt: machine.createdAt.toISOString(),
                updatedAt: machine.updatedAt.toISOString(),
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error updating machine:', error);
            throw new common_1.HttpException('Error updating machine', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteMachineByAdmin(id) {
        try {
            const machine = await this.prisma.machines.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
            });
            if (!machine) {
                throw new common_1.HttpException('Machine not found', common_1.HttpStatus.NOT_FOUND);
            }
            await this.prisma.machines.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
            return { message: 'Machine deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error deleting machine:', error);
            throw new common_1.HttpException('Error deleting machine', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkDeleteMachinesByAdmin(data) {
        try {
            const { machineIds } = data;
            const existingMachines = await this.prisma.machines.findMany({
                where: {
                    id: {
                        in: machineIds,
                    },
                    deletedAt: null,
                },
                select: {
                    id: true,
                },
            });
            const existingIds = existingMachines.map((machine) => machine.id);
            const notFound = machineIds.filter((id) => !existingIds.includes(id));
            if (existingIds.length === 0) {
                throw new common_1.HttpException('No machines found with the provided IDs', common_1.HttpStatus.NOT_FOUND);
            }
            await this.prisma.machines.updateMany({
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
                message: `${existingIds.length} machine(s) deleted successfully`,
                deletedCount: existingIds.length,
                notFound,
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            this.logger.error('Error bulk deleting machines:', error);
            throw new common_1.HttpException('Error bulk deleting machines', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async restore(id) {
        try {
            const machine = await this.prisma.machines.findUnique({
                where: { id },
            });
            if (!machine) {
                throw new common_1.HttpException('Machine not found', common_1.HttpStatus.NOT_FOUND);
            }
            if (!machine.deletedAt) {
                throw new common_1.HttpException('Machine is not deleted', common_1.HttpStatus.BAD_REQUEST);
            }
            await this.prisma.machines.update({
                where: { id },
                data: { deletedAt: null },
            });
            return { message: 'Machine restored successfully' };
        }
        catch (error) {
            this.logger.error(`Error restoring machine with id ${id}:`, error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Error restoring machine', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async bulkRestore(machineIds) {
        try {
            const existingMachines = await this.prisma.machines.findMany({
                where: { id: { in: machineIds } },
                select: {
                    id: true,
                    deletedAt: true,
                },
            });
            const existingMachineIds = existingMachines.map((machine) => machine.id);
            const notFoundIds = machineIds.filter((id) => !existingMachineIds.includes(id));
            const notDeletedMachines = existingMachines.filter((machine) => machine.deletedAt === null);
            const notDeletedIds = notDeletedMachines.map((machine) => machine.id);
            const restorableIds = existingMachineIds.filter((id) => !notDeletedIds.includes(id));
            const restoreResult = await this.prisma.machines.updateMany({
                where: { id: { in: restorableIds } },
                data: { deletedAt: null },
            });
            return {
                message: `Bulk restore completed. ${restoreResult.count} machines restored successfully.`,
                restoredCount: restoreResult.count,
                notFound: notFoundIds,
                notDeleted: notDeletedIds,
            };
        }
        catch (error) {
            this.logger.error('Error bulk restoring machines:', error);
            throw new common_1.HttpException('Error bulk restoring machines', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.MachinesService = MachinesService;
exports.MachinesService = MachinesService = MachinesService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachinesService);
//# sourceMappingURL=machines.service.js.map