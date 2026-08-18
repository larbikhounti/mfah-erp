import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SetRolePermissionsDto } from '../dtos/set-role-permissions.dto';
import { PermissionResponse } from '../types/permission-response.type';

@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByRole(roleId: number): Promise<PermissionResponse[]> {
    const role = await this.prisma.roles.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    return this.prisma.permission.findMany({
      where: { roleId },
      orderBy: { module: 'asc' },
    });
  }

  async setForRole(
    roleId: number,
    dto: SetRolePermissionsDto,
  ): Promise<PermissionResponse[]> {
    const role = await this.prisma.roles.findUnique({ where: { id: roleId } });

    if (!role) {
      throw new HttpException('Role not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.prisma.$transaction(
        dto.permissions.map((entry) =>
          this.prisma.permission.upsert({
            where: { roleId_module: { roleId, module: entry.module } },
            create: {
              roleId,
              module: entry.module,
              canCreate: entry.canCreate,
              canRead: entry.canRead,
              canUpdate: entry.canUpdate,
              canDelete: entry.canDelete,
            },
            update: {
              canCreate: entry.canCreate,
              canRead: entry.canRead,
              canUpdate: entry.canUpdate,
              canDelete: entry.canDelete,
            },
          }),
        ),
      );

      return this.findByRole(roleId);
    } catch (error) {
      this.logger.error(`Error setting permissions for role ${roleId}:`, error);
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error setting role permissions',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
