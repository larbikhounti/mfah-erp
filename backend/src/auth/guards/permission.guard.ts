import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import {
  PERMISSION_KEY,
  PermissionAction,
  RequiredPermission,
} from '../decorator/require-permission.decorator';

const ACTION_FIELD: Record<
  PermissionAction,
  'canCreate' | 'canRead' | 'canUpdate' | 'canDelete'
> = {
  create: 'canCreate',
  read: 'canRead',
  update: 'canUpdate',
  delete: 'canDelete',
};

/**
 * Enforces per-module CRUD permissions for non-admin roles. Routes must
 * carry `@RequirePermission(module, action)`; routes without it are left
 * unrestricted by this guard (pair with `AuthGuard` for authentication).
 * The `admin` role always passes, matching `AdminRoleGuard`'s behavior.
 */
@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<RequiredPermission>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    const userWithRole = await this.prisma.users.findUnique({
      where: { id: user.sub },
      include: { roles: true },
    });

    if (!userWithRole || !userWithRole.roles) {
      throw new ForbiddenException('User role not found');
    }

    if (userWithRole.roles.name.toLowerCase() === 'admin') {
      return true;
    }

    const permission = await this.prisma.permission.findUnique({
      where: {
        roleId_module: {
          roleId: userWithRole.roles.id,
          module: required.module,
        },
      },
    });

    const field = ACTION_FIELD[required.action];
    if (!permission || !permission[field]) {
      throw new ForbiddenException(
        `Role "${userWithRole.roles.name}" does not have ${required.action} permission on ${required.module}`,
      );
    }

    return true;
  }
}
