import { PrismaService } from "../../prisma/prisma.service";
import { SyncRequestDto } from '../dtos/SyncRequest.dto';
import { UploadDataDto } from '../dtos/upload-data.dto';
export declare class SyncService {
    private prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    getUpdatedDataForDome(syncRequest: SyncRequestDto): Promise<{
        data: {
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
                coupons: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    code: string;
                    discount: number;
                    isActive: boolean;
                }[];
                comments: {
                    id: number;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    content: string;
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
                    status: string;
                })[];
                machineChairs: {
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    status: number;
                    machineId: number;
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
                    deletedAt: Date | null;
                    password: string;
                    email: string;
                    dom_id: number | null;
                    jwtToken: string | null;
                    role_id: number | null;
                    accessToken: string | null;
                })[];
                games: ({
                    gameMachineTypes: {
                        id: number;
                        createdAt: Date;
                        updatedAt: Date;
                        machineTypeId: number;
                        gameId: number;
                    }[];
                    gameTypes: {
                        id: number;
                    };
                } & {
                    id: number;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    deletedAt: Date | null;
                    price: number;
                    playTime: number;
                    age: number | null;
                    isFavored: boolean;
                    gameTypeId: number | null;
                })[];
            };
            serverTime: Date;
        };
    }>;
    uploadData(uploadData: UploadDataDto): Promise<{
        success: boolean;
        message: string;
        data: {
            domId: number;
            experiencesProcessed: number;
            ticketsProcessed: number;
        };
    }>;
}
