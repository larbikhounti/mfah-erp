import { PrismaService } from '../../prisma/prisma.service';
import { CreateMachineChairDto } from '../dtos/create-machine-chair.dto';
import { UpdateMachineChairDto } from '../dtos/update-machine-chair.dto';
import { BulkDeleteMachineChairsDto } from '../dtos/bulk-delete-machine-chairs.dto';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import { machineChairs } from '@prisma/client';
export declare class MachineChairsService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: CreateMachineChairDto): Promise<string | Error>;
    findAll(filterParams: FilterParamsDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(id: number): Promise<machineChairs | null>;
    update(id: number, data: UpdateMachineChairDto): Promise<string | Error>;
    remove(id: number): Promise<string | Error>;
    bulkDelete(data: BulkDeleteMachineChairsDto): Promise<string | Error>;
    findByMachineId(machineId: number): Promise<machineChairs[]>;
    restore(id: number): Promise<string | Error>;
    bulkRestore(ids: number[]): Promise<{
        message: string;
        restoredCount: number;
        notFound: number[];
        notDeleted: number[];
    }>;
}
