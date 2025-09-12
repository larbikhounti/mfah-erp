import { CreateMachineDto } from '../dtos/create-machine.dto';
import { UpdateMachineDto } from '../dtos/update-machine.dto';
import { BulkDeleteMachinesDto } from '../dtos/bulk-delete-machines.dto';
import { FilterMachinesDto } from '../dtos/filter/filter-machines.dto';
import { MachinesService } from '../services/machines.service';
export declare class MachinesController {
    private machinesService;
    constructor(machinesService: MachinesService);
    getAllMachines(filterParams: FilterMachinesDto): Promise<{
        data: import("../types/machine-response.type").MachineResponse[];
        total: number;
    }>;
    getMachineById(id: number): Promise<import("../types/machine-response.type").MachineResponse>;
    getAllMachinesAdmin(filterParams: FilterMachinesDto): Promise<{
        data: import("../types/machine-response.type").MachineResponse[];
        total: number;
    }>;
    createMachineByAdmin(createMachineDto: CreateMachineDto): Promise<import("../types/machine-response.type").MachineResponse>;
    getMachineByIdAdmin(id: number): Promise<import("../types/machine-response.type").MachineResponse>;
    updateMachineByAdmin(id: number, updateMachineDto: UpdateMachineDto): Promise<import("../types/machine-response.type").MachineResponse>;
    bulkDeleteMachinesByAdmin(bulkDeleteDto: BulkDeleteMachinesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
    deleteMachineByAdmin(id: number): Promise<{
        message: string;
    }>;
}
