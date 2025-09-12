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
var MachineChairsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachineChairsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MachineChairsService = MachineChairsService_1 = class MachineChairsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(MachineChairsService_1.name);
    }
    async create(data) {
        try {
            await this.prisma.machineChairs.create({
                data: Object.assign(Object.assign({}, data), { createdAt: new Date(), updatedAt: new Date() }),
            });
            return `Machine chair created successfully`;
        }
        catch (error) {
            console.error('Error creating machine chair:', error);
            return new common_1.HttpException('Error creating machine chair', 500);
        }
    }
    async findAll(filterParams) {
        try {
            const { offset = 0, limit = 10, search, status, machineId, } = filterParams;
            const where = {};
            if (search) {
                where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
            }
            if (status !== undefined) {
                where.status = status;
            }
            if (machineId) {
                where.machineId = machineId;
            }
            where.deletedAt = null;
            const [machineChairs, total] = await Promise.all([
                this.prisma.machineChairs.findMany({
                    where,
                    skip: Number(offset),
                    take: Number(limit),
                    include: {
                        machines: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                    orderBy: {
                        createdAt: 'desc',
                    },
                }),
                this.prisma.machineChairs.count({ where }),
            ]);
            return { data: machineChairs, total };
        }
        catch (error) {
            console.error('Error fetching machine chairs:', error);
            throw new common_1.HttpException('Error fetching machine chairs', 500);
        }
    }
    async findOne(id) {
        try {
            return await this.prisma.machineChairs.findFirst({
                where: {
                    id,
                    deletedAt: null,
                },
                include: {
                    machines: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            });
        }
        catch (error) {
            console.error('Error fetching machine chair:', error);
            throw new common_1.HttpException('Error fetching machine chair', 500);
        }
    }
    async update(id, data) {
        try {
            await this.prisma.machineChairs.update({
                where: { id },
                data: Object.assign(Object.assign({}, data), { updatedAt: new Date() }),
            });
            return `Machine chair updated successfully`;
        }
        catch (error) {
            console.error('Error updating machine chair:', error);
            return new common_1.HttpException('Error updating machine chair', 500);
        }
    }
    async remove(id) {
        try {
            await this.prisma.machineChairs.update({
                where: { id },
                data: {
                    deletedAt: new Date(),
                },
            });
            return `Machine chair deleted successfully`;
        }
        catch (error) {
            console.error('Error deleting machine chair:', error);
            return new common_1.HttpException('Error deleting machine chair', 500);
        }
    }
    async bulkDelete(data) {
        try {
            await this.prisma.machineChairs.updateMany({
                where: {
                    id: {
                        in: data.ids,
                    },
                },
                data: {
                    deletedAt: new Date(),
                },
            });
            return `Machine chairs deleted successfully`;
        }
        catch (error) {
            console.error('Error bulk deleting machine chairs:', error);
            return new common_1.HttpException('Error bulk deleting machine chairs', 500);
        }
    }
    async findByMachineId(machineId) {
        try {
            return await this.prisma.machineChairs.findMany({
                where: {
                    machineId,
                    deletedAt: null,
                },
                orderBy: {
                    name: 'asc',
                },
            });
        }
        catch (error) {
            console.error('Error fetching machine chairs by machine ID:', error);
            throw new common_1.HttpException('Error fetching machine chairs by machine ID', 500);
        }
    }
};
exports.MachineChairsService = MachineChairsService;
exports.MachineChairsService = MachineChairsService = MachineChairsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachineChairsService);
//# sourceMappingURL=machine-chairs.service.js.map