import { RegisterUserDto } from '../dtos/register.dto';
import { UsersService } from '../services/users.service';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
export declare class UserController {
    private usersService;
    constructor(usersService: UsersService);
    getAllUsers(filterParams: FilterParamsDto): Promise<{
        data: any[];
        total: number;
    }>;
    registerUser(registerUserDto: RegisterUserDto): Promise<string | Error>;
}
