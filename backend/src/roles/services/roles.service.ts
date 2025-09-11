import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { UpdateRoleDto } from '../dtos/update-role.dto';
import { BulkDeleteRolesDto } from '../dtos/bulk-delete-roles.dto';
import { FilterRolesDto } from '../dtos/filter-roles.dto';
import { RoleResponse } from '../types/role-response.type';

@Injectable()
export class RolesService {
  private readonly logger = new Logger(RolesService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRoleDto): Promise<RoleResponse> {
    try {
      // Check if role with this name already exists
      const existingRole = await this.prisma.roles.findUnique({
        where: { name: data.name },
      });

      if (existingRole) {
        throw new HttpException(
          'Role with this name already exists',
          HttpStatus.CONFLICT,
        );
      }

      const role = await this.prisma.roles.create({
        data: {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              Users: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      this.logger.error('Error creating role:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error creating role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll(
    filterParams: FilterRolesDto,
  ): Promise<{ data: RoleResponse[]; total: number }> {
    try {
      const { offset = 0, limit = 10, search, roleId } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {};

      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }

      if (roleId) {
        where.id = roleId;
      }

      // Execute queries in parallel
      const [roles, total] = await Promise.all([
        this.prisma.roles.findMany({
          where,
          skip: offset,
          take: limit,
          include: {
            _count: {
              select: {
                Users: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        }),
        this.prisma.roles.count({ where }),
      ]);

      return {
        data: roles,
        total,
      };
    } catch (error) {
      this.logger.error('Error fetching roles:', error);
      throw new HttpException(
        'Error fetching roles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: number): Promise<RoleResponse> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              Users: true,
            },
          },
        },
      });

      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      return role;
    } catch (error) {
      this.logger.error(`Error fetching role with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error fetching role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(id: number, data: UpdateRoleDto): Promise<RoleResponse> {
    try {
      // Check if role exists
      const existingRole = await this.prisma.roles.findUnique({
        where: { id },
      });

      if (!existingRole) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      // Check if another role with this name already exists (if name is being updated)
      if (data.name && data.name !== existingRole.name) {
        const nameConflict = await this.prisma.roles.findUnique({
          where: { name: data.name },
        });

        if (nameConflict) {
          throw new HttpException(
            'Name already taken by another role',
            HttpStatus.CONFLICT,
          );
        }
      }

      const role = await this.prisma.roles.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          _count: {
            select: {
              Users: true,
            },
          },
        },
      });

      return role;
    } catch (error) {
      this.logger.error(`Error updating role with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error updating role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              Users: true,
            },
          },
        },
      });

      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      // Check if role has related users
      if (role._count && role._count.Users > 0) {
        throw new HttpException(
          'Cannot delete role with related users',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.roles.delete({
        where: { id },
      });

      return { message: 'Role deleted successfully' };
    } catch (error) {
      this.logger.error(`Error deleting role with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error deleting role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkDelete(
    bulkDeleteDto: BulkDeleteRolesDto,
  ): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    hasRelatedRecords: number[];
  }> {
    try {
      const { roleIds } = bulkDeleteDto;
      let deletedCount = 0;
      const notFound: number[] = [];
      const hasRelatedRecords: number[] = [];

      for (const roleId of roleIds) {
        try {
          const role = await this.prisma.roles.findUnique({
            where: { id: roleId },
            include: {
              _count: {
                select: {
                  Users: true,
                },
              },
            },
          });

          if (!role) {
            notFound.push(roleId);
            continue;
          }

          // Check if role has related users
          if (role._count && role._count.Users > 0) {
            hasRelatedRecords.push(roleId);
            continue;
          }

          await this.prisma.roles.delete({
            where: { id: roleId },
          });

          deletedCount++;
        } catch (error) {
          this.logger.error(`Error deleting role ${roleId}:`, error);
          // Continue with next role instead of failing the entire operation
        }
      }

      return {
        message: `Bulk delete completed. ${deletedCount} roles deleted.`,
        deletedCount,
        notFound,
        hasRelatedRecords,
      };
    } catch (error) {
      this.logger.error('Error in bulk delete roles:', error);
      throw new HttpException(
        'Error in bulk delete operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
