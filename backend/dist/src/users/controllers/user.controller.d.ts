import { RegisterUserDto } from '../dtos/register.dto';
import { CreateUserByAdminDto } from '../dtos/create-user-admin.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { BulkDeleteUsersDto } from '../dtos/bulk-delete-users.dto';
import { UsersService } from '../services/users.service';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
export declare class UserController {
    private usersService;
    constructor(usersService: UsersService);
    getAllUsersAdmin(filterParams: FilterParamsDto): Promise<{
        data: any[];
        total: number;
    }>;
    registerUser(registerUserDto: RegisterUserDto): Promise<string | Error>;
    createUserByAdmin(createUserDto: CreateUserByAdminDto): Promise<import("../types/user-response.type").UserResponse>;
    getUserById(id: number): Promise<import("../types/user-response.type").UserResponse>;
    updateUserByAdmin(id: number, updateUserDto: UpdateUserDto): Promise<import("../types/user-response.type").UserResponse>;
    bulkDeleteUsersByAdmin(bulkDeleteDto: BulkDeleteUsersDto): Promise<{
        message: string;
        deletedCount: number;
        notFound: number[];
    }>;
    deleteUserByAdmin(id: number): Promise<{
        message: string;
    }>;
    getAllRoles(): Promise<any[]>;
    restore(id: number): Promise<{
        message: string;
    }>;
    bulkRestore(body: {
        userIds: number[];
    }): Promise<{
        message: string;
        restoredCount: number;
    }>;
}
