import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineDto } from '../dtos/create-machine.dto';
import { UpdateMachineDto } from '../dtos/update-machine.dto';
import { BulkDeleteMachinesDto } from '../dtos/bulk-delete-machines.dto';
import { FilterMachinesDto } from '../dtos/filter/filter-machines.dto';
import { MachineResponse } from '../types/machine-response.type';
export declare class MachinesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filterParams: FilterMachinesDto): Promise<{
        data: MachineResponse[];
        total: number;
    }>;
    createMachineByAdmin(data: CreateMachineDto): Promise<MachineResponse>;
    getMachineById(id: number): Promise<MachineResponse>;
    updateMachineByAdmin(id: number, data: UpdateMachineDto): Promise<MachineResponse>;
    deleteMachineByAdmin(id: number): Promise<{
        message: string;
    }>;
    bulkDeleteMachinesByAdmin(data: BulkDeleteMachinesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
    restore(id: number): Promise<{
        message: string;
    }>;
    bulkRestore(machineIds: number[]): Promise<{
        message: string;
        restoredCount: number;
        notFound: number[];
        notDeleted: number[];
    }>;
}
