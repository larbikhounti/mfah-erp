import { CreateMachineChairDto } from '../dtos/create-machine-chair.dto';
import { UpdateMachineChairDto } from '../dtos/update-machine-chair.dto';
import { BulkDeleteMachineChairsDto } from '../dtos/bulk-delete-machine-chairs.dto';
import { MachineChairsService } from '../services/machine-chairs.service';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
export declare class MachineChairsController {
    private machineChairsService;
    constructor(machineChairsService: MachineChairsService);
    findAll(filterParams: FilterParamsDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(id: number): Promise<{
        name: string;
        id: number;
        status: number;
        machineId: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }>;
    create(createMachineChairDto: CreateMachineChairDto): Promise<string | Error>;
    update(id: number, updateMachineChairDto: UpdateMachineChairDto): Promise<string | Error>;
    bulkDelete(bulkDeleteMachineChairsDto: BulkDeleteMachineChairsDto): Promise<string | Error>;
    remove(id: number): Promise<string | Error>;
    findByMachineId(machineId: number): Promise<{
        name: string;
        id: number;
        status: number;
        machineId: number;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
    }[]>;
}
