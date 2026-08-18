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
      const {
        offset = 0,
        limit = 10,
        search,
        roleId,
        showArchived,
      } = filterParams;

      // Build the where clause based on filter parameters
      const where: any = {
        deletedAt: showArchived ? undefined : null, // Filter based on showArchived
      };

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
      });

      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      // Check if already deleted
      if (role.deletedAt) {
        throw new HttpException(
          'Role is already deleted',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Soft delete the role
      await this.prisma.roles.update({
        where: { id },
        data: { deletedAt: new Date() },
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

  async bulkDelete(bulkDeleteDto: BulkDeleteRolesDto): Promise<{
    message: string;
    deletedCount: number;
    notFound: number[];
    alreadyDeleted: number[];
  }> {
    try {
      const { roleIds } = bulkDeleteDto;

      // Check which roles exist
      const existingRoles = await this.prisma.roles.findMany({
        where: { id: { in: roleIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingRoleIds = existingRoles.map((role) => role.id);
      const notFoundIds = roleIds.filter((id) => !existingRoleIds.includes(id));

      // Filter out roles that are already deleted
      const alreadyDeletedRoles = existingRoles.filter(
        (role) => role.deletedAt !== null,
      );
      const alreadyDeletedIds = alreadyDeletedRoles.map((role) => role.id);

      const deletableIds = existingRoleIds.filter(
        (id) => !alreadyDeletedIds.includes(id),
      );

      // Soft delete roles
      const deleteResult = await this.prisma.roles.updateMany({
        where: { id: { in: deletableIds } },
        data: { deletedAt: new Date() },
      });

      return {
        message: `Bulk delete completed. ${deleteResult.count} roles deleted.`,
        deletedCount: deleteResult.count,
        notFound: notFoundIds,
        alreadyDeleted: alreadyDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error in bulk delete roles:', error);
      throw new HttpException(
        'Error in bulk delete operation',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async restore(id: number): Promise<{ message: string }> {
    try {
      const role = await this.prisma.roles.findUnique({
        where: { id },
      });

      if (!role) {
        throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
      }

      if (!role.deletedAt) {
        throw new HttpException('Role is not deleted', HttpStatus.BAD_REQUEST);
      }

      await this.prisma.roles.update({
        where: { id },
        data: { deletedAt: null },
      });

      return { message: 'Role restored successfully' };
    } catch (error) {
      this.logger.error(`Error restoring role with id ${id}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error restoring role',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async bulkRestore(roleIds: number[]): Promise<{
    message: string;
    restoredCount: number;
    notFound: number[];
    notDeleted: number[];
  }> {
    try {
      const existingRoles = await this.prisma.roles.findMany({
        where: { id: { in: roleIds } },
        select: {
          id: true,
          deletedAt: true,
        },
      });

      const existingRoleIds = existingRoles.map((role) => role.id);
      const notFoundIds = roleIds.filter((id) => !existingRoleIds.includes(id));

      const notDeletedRoles = existingRoles.filter(
        (role) => role.deletedAt === null,
      );
      const notDeletedIds = notDeletedRoles.map((role) => role.id);

      const restorableIds = existingRoleIds.filter(
        (id) => !notDeletedIds.includes(id),
      );

      const restoreResult = await this.prisma.roles.updateMany({
        where: { id: { in: restorableIds } },
        data: { deletedAt: null },
      });

      return {
        message: `Bulk restore completed. ${restoreResult.count} roles restored successfully.`,
        restoredCount: restoreResult.count,
        notFound: notFoundIds,
        notDeleted: notDeletedIds,
      };
    } catch (error) {
      this.logger.error('Error bulk restoring roles:', error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error bulk restoring roles',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
