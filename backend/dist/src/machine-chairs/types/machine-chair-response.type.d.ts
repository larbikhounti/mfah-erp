export interface MachineChairResponse {
    id: number;
    name: string;
    status: number;
    machineId: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date | null;
    machines?: {
        id: number;
        name: string;
    };
}
