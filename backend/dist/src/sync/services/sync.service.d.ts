import { PrismaService } from '@app/prisma/prisma.service';
import { SyncRequestDto } from '../dtos/SyncRequest.dto';
export declare class SyncService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getUpdatedDataForDome(syncRequest: SyncRequestDto): Promise<{
        globalData: {
            gameTypes: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            }[];
            machineTypes: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            }[];
            roles: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
            }[];
        };
        domeSpecificData: {
            doms: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                address: string;
            }[];
            machines: ({
                machineTypes: {
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                };
            } & {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                alias: string;
                machineTypeId: number;
                domeId: number | null;
                ticketNumber: number;
            })[];
            machineChairs: {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                machineId: number;
                status: number;
            }[];
            users: ({
                roles: {
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                };
            } & {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                password: string;
                email: string;
                dom_id: number | null;
                jwtToken: string | null;
                role_id: number | null;
                accessToken: string | null;
            })[];
            games: ({
                machineTypes: {
                    id: number;
                };
                gameTypes: {
                    id: number;
                };
            } & {
                id: number;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                machineTypeId: number | null;
                price: number;
                playTime: number;
                age: number | null;
                gameTypeId: number | null;
            })[];
        };
        serverTime: Date;
    }>;
}
