import { doms, games, gameTypes, machineChairs, machines, machineTypes, roles, Users } from '@prisma/client';
export declare class SyncResponseDto {
    globalData: {
        gameTypes: gameTypes[];
        machineTypes: machineTypes[];
        games: games[];
        roles: roles[];
    };
    domeSpecificData: {
        doms: doms[];
        machines: machines[];
        machineChairs: machineChairs[];
        users: Users[];
    };
    serverTime: Date;
}
