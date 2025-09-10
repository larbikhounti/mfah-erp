import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dtos/register.dto';
import { hashPassword } from 'src/helpers/helper.helpers';
import { Users } from 'generated/prisma';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: RegisterUserDto): Promise<string | Error> {
    try {
      const hashedPassword = await hashPassword(data.password);
      await this.prisma.users.create({
        data: {
          ...data,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return `User created successfully`;
    } catch (error) {
      console.error('Error creating user:', error);
      return new HttpException('Error creating user', 500);
    }
  }

  async findAll(
    limit: number = 10,
    page: number = 1,
    filter: string = '',
  ): Promise<{ data: Users[]; total: number }> {
    try {
      const skip = (page - 1) * limit;
      
      const where = filter
        ? {
            OR: [
              { email: { contains: filter, mode: 'insensitive' as const } },
              { name: { contains: filter, mode: 'insensitive' as const } },
            ],
          }
        : {};

      const [users, total] = await Promise.all([
        this.prisma.users.findMany({
          where,
          skip,
          take: limit,
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            domId: true,
            roleId: true,
            dom: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.users.count({ where }),
      ]);

      return { data: users, total };
    } catch (error) {
      this.logger.error('Error finding users', error);
      throw new HttpException(
        'Error retrieving users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(email: string): Promise<Users | null> {
    try {
      return await this.prisma.users.findUnique({
        where: { email },
      });
    } catch (error: any) {
      this.logger.error('Error finding user', error);
      throw new HttpException(
        'email or password is incorrect',
        HttpStatus.NON_AUTHORITATIVE_INFORMATION,
      );
    }
  }
}
