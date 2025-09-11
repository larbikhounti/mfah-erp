import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dtos/register.dto';
import { hashPassword } from 'src/helpers/helper.helpers';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import { Users } from '@prisma/client';

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

async findAll(filterParams: FilterParamsDto): Promise<{ data: any[]; total: number }> {
  try {
    const { offset = 0, limit = 10, search, status, userId } = filterParams;
    
    // Build the where clause based on filter parameters
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (userId) {
      where.id = userId;
    }
    
    // Execute queries in parallel
    const [users, total] = await Promise.all([
      this.prisma.users.findMany({
        where,
        skip: offset,
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

    // Transform the data to match the required format
    const formattedData = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role?.name || null,
      dom: user.dom?.name || null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    }));

    return { data: formattedData, total };
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
