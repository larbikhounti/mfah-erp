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
var SyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncService = void 0;
const prisma_service_1 = require("../../prisma/prisma.service");
const common_1 = require("@nestjs/common");
let SyncService = SyncService_1 = class SyncService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(SyncService_1.name);
    }
    async getUpdatedDataForDome(syncRequest) {
        const { domeId, lastSync } = syncRequest;
        let syncLog;
        try {
            const dome = await this.prisma.doms.findFirst({
                where: {
                    id: domeId,
                    deletedAt: null,
                },
            });
            if (!dome) {
                throw new Error(`Dome with ID ${domeId} not found or deleted in central database`);
            }
            syncLog = await this.prisma.domeSyncLog.create({
                data: {
                    domeId,
                    lastSyncAt: lastSync,
                    wasSuccess: false,
                },
            });
            const [gameTypes, machineTypes, games, roles] = await Promise.all([
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
                this.prisma.games.findMany({
                    where: {
                        updatedAt: { gt: lastSync },
                        deletedAt: null,
                    },
                    include: {
                        gameTypes: true,
                        machineTypes: true,
                    },
                }),
                this.prisma.roles.findMany({
                    where: {
                        updatedAt: { gt: lastSync },
                        deletedAt: null,
                    },
                }),
            ]);
            const [doms, machines, users] = await Promise.all([
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
            ]);
            const machineIds = machines.map((machine) => machine.id);
            const machineChairs = await this.prisma.machineChairs.findMany({
                where: {
                    machineId: { in: machineIds },
                    updatedAt: { gt: lastSync },
                    deletedAt: null,
                },
            });
            const response = {
                globalData: {
                    gameTypes,
                    machineTypes,
                    games,
                    roles,
                },
                domeSpecificData: {
                    doms,
                    machines,
                    machineChairs,
                    users,
                },
                serverTime: new Date(),
            };
            const dataCount = gameTypes.length +
                machineTypes.length +
                games.length +
                roles.length +
                doms.length +
                machines.length +
                machineChairs.length +
                users.length;
            await this.prisma.domeSyncLog.update({
                where: { id: syncLog.id },
                data: {
                    wasSuccess: true,
                    dataCount,
                },
            });
            this.logger.log(`Central server successfully provided data to dome ${domeId}. Returned ${dataCount} records.`);
            return response;
        }
        catch (error) {
            this.logger.error(`Sync failed for dome ${domeId}: ${error.message}`);
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
};
exports.SyncService = SyncService;
exports.SyncService = SyncService = SyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SyncService);
//# sourceMappingURL=sync.service.js.map