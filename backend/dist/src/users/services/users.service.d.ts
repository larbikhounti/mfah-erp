import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dtos/register.dto';
import { Users } from 'generated/prisma';
export declare class UsersService {
    private readonly prisma;
    private readonly logger;
    constructor(prisma: PrismaService);
    create(data: RegisterUserDto): Promise<string | Error>;
    findOne(email: string): Promise<Users | null>;
}
