import { doms, gameTypes, machineChairs, machines, machineTypes, roles, Users } from '@prisma/client';
export declare class SyncResponseDto {
    data: {
        globalData: {
            gameTypes: gameTypes[];
            machineTypes: machineTypes[];
            roles: roles[];
        };
        domeSpecificData: {
            doms: doms[];
            machines: machines[];
            machineChairs: machineChairs[];
            users: Users[];
        };
        serverTime: Date;
    };
}
