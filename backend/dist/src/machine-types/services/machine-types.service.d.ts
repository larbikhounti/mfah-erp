import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineTypeDto } from '../dtos/create-machine-type.dto';
import { UpdateMachineTypeDto } from '../dtos/update-machine-type.dto';
import { BulkDeleteMachineTypesDto } from '../dtos/bulk-delete-machine-types.dto';
import { FilterMachineTypesDto } from '../dtos/filter/filter-machine-types.dto';
import { MachineTypeResponse } from '../types/machine-type-response.type';
export declare class MachineTypesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    findAll(filterParams: FilterMachineTypesDto): Promise<{
        data: MachineTypeResponse[];
        total: number;
    }>;
    createMachineTypeByAdmin(createMachineTypeDto: CreateMachineTypeDto): Promise<MachineTypeResponse>;
    getMachineTypeById(id: number): Promise<MachineTypeResponse>;
    updateMachineTypeByAdmin(id: number, updateMachineTypeDto: UpdateMachineTypeDto): Promise<MachineTypeResponse>;
    deleteMachineTypeByAdmin(id: number): Promise<{
        message: string;
    }>;
    bulkDeleteMachineTypesByAdmin(bulkDeleteDto: BulkDeleteMachineTypesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
    restore(id: number): Promise<{
        message: string;
    }>;
    bulkRestore(machineTypeIds: number[]): Promise<{
        message: string;
        restoredCount: number;
        notFound: number[];
        notDeleted: number[];
    }>;
}
