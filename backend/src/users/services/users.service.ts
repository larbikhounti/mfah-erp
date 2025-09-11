import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterUserDto } from '../dtos/register.dto';
import { CreateUserByAdminDto } from '../dtos/create-user-admin.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { BulkDeleteUsersDto } from '../dtos/bulk-delete-users.dto';
import { hashPassword } from 'src/helpers/helper.helpers';
import { FilterParamsDto } from '../dtos/filter/filter-params.dto';
import { Users } from '@prisma/client';
import { UserResponse } from '../types/user-response.type';

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
    filterParams: FilterParamsDto,
  ): Promise<{ data: any[]; total: number }> {
    try {
      const { offset = 0, limit = 10, search, status, userId } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {};

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
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
            dom_id: true,
            role_id: true,
            doms: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            roles: {
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
      const formattedData = users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.roles?.name || null,
        dom: user.doms?.name || null,
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

  // Admin CRUD operations
  async createUserByAdmin(data: CreateUserByAdminDto): Promise<UserResponse> {
    try {
      const hashedPassword = await hashPassword(data.password);

      // Check if email already exists
      const existingUser = await this.prisma.users.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new HttpException(
          'User with this email already exists',
          HttpStatus.CONFLICT,
        );
      }

      const user = await this.prisma.users.create({
        data: {
          ...data,
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          roles: true,
          doms: true,
        },
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as UserResponse;
    } catch (error) {
      this.logger.error('Error creating user by admin:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateUserByAdmin(
    id: number,
    data: UpdateUserDto,
  ): Promise<UserResponse> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.users.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // If email is being updated, check if it's already taken by another user
      if (data.email && data.email !== existingUser.email) {
        const emailExists = await this.prisma.users.findUnique({
          where: { email: data.email },
        });

        if (emailExists) {
          throw new HttpException(
            'User with this email already exists',
            HttpStatus.CONFLICT,
          );
        }
      }

      // Hash password if provided
      const updateData = { ...data };
      if (data.password) {
        updateData.password = await hashPassword(data.password);
      }

      const user = await this.prisma.users.update({
        where: { id },
        data: {
          ...updateData,
          updatedAt: new Date(),
        },
        include: {
          roles: true,
          doms: true,
        },
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as UserResponse;
    } catch (error) {
      this.logger.error('Error updating user by admin:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteUserByAdmin(id: number): Promise<{ message: string }> {
    try {
      // Check if user exists
      const existingUser = await this.prisma.users.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      await this.prisma.users.delete({
        where: { id },
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting user by admin:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserById(id: number): Promise<UserResponse> {
    try {
      const user = await this.prisma.users.findUnique({
        where: { id },
        include: {
          roles: true,
          doms: true,
        },
      });

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as UserResponse;
    } catch (error) {
      this.logger.error('Error finding user by id:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error retrieving user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDeleteUsersByAdmin(
    bulkDeleteDto: BulkDeleteUsersDto,
  ): Promise<{ message: string; deletedCount: number; notFound: number[] }> {
    try {
      const { userIds } = bulkDeleteDto;

      // Check which users exist
      const existingUsers = await this.prisma.users.findMany({
        where: { id: { in: userIds } },
        select: { id: true },
      });

      const existingUserIds = existingUsers.map((user) => user.id);
      const notFoundIds = userIds.filter((id) => !existingUserIds.includes(id));

      // Delete existing users
      const deleteResult = await this.prisma.users.deleteMany({
        where: { id: { in: existingUserIds } },
      });

      return {
        message: `Bulk delete completed. ${deleteResult.count} users deleted successfully.`,
        deletedCount: deleteResult.count,
        notFound: notFoundIds,
      };
    } catch (error) {
      this.logger.error('Error bulk deleting users by admin:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error bulk deleting users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
