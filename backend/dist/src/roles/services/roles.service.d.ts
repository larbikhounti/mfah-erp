import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { BulkDeleteRolesDto } from '../dtos/bulk-delete-roles.dto';
import { FilterRolesDto } from '../dtos/filter-roles.dto';
import { RoleResponse } from '../types/role-response.type';
export declare class RolesService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: CreateRoleDto): Promise<RoleResponse>;
    findAll(filterParams: FilterRolesDto): Promise<{
        data: RoleResponse[];
        total: number;
    }>;
    findOne(id: number): Promise<RoleResponse>;
    update(id: number, data: UpdateRoleDto): Promise<RoleResponse>;
    remove(id: number): Promise<{
        message: string;
    }>;
    bulkDelete(bulkDeleteDto: BulkDeleteRolesDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
        hasRelatedRecords: number[];
    }>;
}
