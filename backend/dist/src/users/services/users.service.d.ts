import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dtos/register.dto';
import { CreateUserByAdminDto } from '../dtos/create-user-admin.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { BulkDeleteUsersDto } from '../dtos/bulk-delete-users.dto';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import { Users } from '@prisma/client';
import { UserResponse } from '../types/user-response.type';
export declare class UsersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: RegisterUserDto): Promise<string | Error>;
    findAll(filterParams: FilterParamsDto): Promise<{
        data: any[];
        total: number;
    }>;
    findOne(email: string): Promise<Users | null>;
    createUserByAdmin(data: CreateUserByAdminDto): Promise<UserResponse>;
    updateUserByAdmin(id: number, data: UpdateUserDto): Promise<UserResponse>;
    deleteUserByAdmin(id: number): Promise<{
        message: string;
    }>;
    getUserById(id: number): Promise<UserResponse>;
    bulkDeleteUsersByAdmin(bulkDeleteDto: BulkDeleteUsersDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
    getAllRoles(): Promise<any[]>;
}
