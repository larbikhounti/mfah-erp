import { RegisterUserDto } from '../dtos/register.dto';
import { UsersService } from '../services/users.service';
export declare class UserController {
    private usersService;
    constructor(usersService: UsersService);
    registerUser(registerUserDto: RegisterUserDto): Promise<string | Error>;
}
