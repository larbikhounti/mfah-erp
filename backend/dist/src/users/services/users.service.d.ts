import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dtos/register.dto';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import { Users } from '@prisma/client';
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
}
