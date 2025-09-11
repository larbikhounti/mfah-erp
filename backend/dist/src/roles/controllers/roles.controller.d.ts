import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { BulkDeleteRolesDto } from '../dtos/bulk-delete-roles.dto';
import { FilterRolesDto } from '../dtos/filter-roles.dto';
import { RolesService } from '../services/roles.service';
export declare class RolesController {
    private rolesService;
    constructor(rolesService: RolesService);
    getAllRoles(filterParams: FilterRolesDto): Promise<{
        data: import("../types/role-response.type").RoleResponse[];
        total: number;
    }>;
    getRoleById(id: number): Promise<import("../types/role-response.type").RoleResponse>;
    createRole(createRoleDto: CreateRoleDto): Promise<import("../types/role-response.type").RoleResponse>;
    getRoleByIdAdmin(id: number): Promise<import("../types/role-response.type").RoleResponse>;
    updateRole(id: number, updateRoleDto: UpdateRoleDto): Promise<import("../types/role-response.type").RoleResponse>;
    deleteRole(id: number): Promise<{
        message: string;
    }>;
    bulkDeleteRoles(bulkDeleteDto: BulkDeleteRolesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
        hasRelatedRecords: number[];
    }>;
    getAllRolesAdmin(filterParams: FilterRolesDto): Promise<{
        data: import("../types/role-response.type").RoleResponse[];
        total: number;
    }>;
}
