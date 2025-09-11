import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.sub) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user with role information
    const userWithRole = await this.prisma.users.findUnique({
      where: { id: user.sub },
      include: {
        roles: true,
      },
    });

    if (!userWithRole || !userWithRole.roles) {
      throw new ForbiddenException('User role not found');
    }

    // Check if user has admin role (assuming 'admin' is the role name)
    const isAdmin = userWithRole.roles.name.toLowerCase() === 'admin';

    if (!isAdmin) {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
