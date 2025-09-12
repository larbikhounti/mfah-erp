import { CreateMachineTypeDto } from '../dtos/create-machine-type.dto';
import { UpdateMachineTypeDto } from '../dtos/update-machine-type.dto';
import { BulkDeleteMachineTypesDto } from '../dtos/bulk-delete-machine-types.dto';
import { FilterMachineTypesDto } from '../dtos/filter/filter-machine-types.dto';
import { MachineTypesService } from '../services/machine-types.service';
export declare class MachineTypesController {
    private machineTypesService;
    constructor(machineTypesService: MachineTypesService);
    getAllMachineTypes(filterParams: FilterMachineTypesDto): Promise<{
        data: import("../types/machine-type-response.type").MachineTypeResponse[];
        total: number;
    }>;
    getMachineTypeById(id: number): Promise<import("../types/machine-type-response.type").MachineTypeResponse>;
    getAllMachineTypesAdmin(filterParams: FilterMachineTypesDto): Promise<{
        data: import("../types/machine-type-response.type").MachineTypeResponse[];
        total: number;
    }>;
    createMachineTypeByAdmin(createMachineTypeDto: CreateMachineTypeDto): Promise<import("../types/machine-type-response.type").MachineTypeResponse>;
    getMachineTypeByIdAdmin(id: number): Promise<import("../types/machine-type-response.type").MachineTypeResponse>;
    updateMachineTypeByAdmin(id: number, updateMachineTypeDto: UpdateMachineTypeDto): Promise<import("../types/machine-type-response.type").MachineTypeResponse>;
    bulkDeleteMachineTypesByAdmin(bulkDeleteDto: BulkDeleteMachineTypesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
    deleteMachineTypeByAdmin(id: number): Promise<{
        message: string;
    }>;
}
