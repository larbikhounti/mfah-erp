import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionModule } from '@prisma/client';
import { PermissionGuard } from './permission.guard';
import { RequiredPermission } from '../decorator/require-permission.decorator';
import {
  asPrismaService,
  createPrismaMock,
  PrismaMock,
} from '../../../test/helpers/prisma-mock';

const contextFor = (user: unknown): ExecutionContext =>
  ({
    getHandler: () => undefined,
    getClass: () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('PermissionGuard', () => {
  let prisma: PrismaMock;
  let reflector: Reflector;
  let guard: PermissionGuard;

  const requireOnRoute = (permission: RequiredPermission | undefined) =>
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(permission);

  const userWithRole = (name: string) =>
    prisma.users.findUnique.mockResolvedValue({
      id: 1,
      roles: { id: 5, name },
    });

  beforeEach(() => {
    prisma = createPrismaMock();
    reflector = new Reflector();
    guard = new PermissionGuard(reflector, asPrismaService(prisma));
  });

  it('lets through routes without @RequirePermission', async () => {
    requireOnRoute(undefined);
    await expect(guard.canActivate(contextFor({ sub: 1 }))).resolves.toBe(true);
  });

  it('rejects an unauthenticated request', async () => {
    requireOnRoute({ module: PermissionModule.MISSIONS, action: 'read' });
    await expect(
      guard.canActivate(contextFor(undefined)),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('always lets the admin role through, whatever its case', async () => {
    requireOnRoute({ module: PermissionModule.MISSIONS, action: 'delete' });
    userWithRole('ADMIN');

    await expect(guard.canActivate(contextFor({ sub: 1 }))).resolves.toBe(true);
    expect(prisma.permission.findUnique).not.toHaveBeenCalled();
  });

  it('allows a non-admin role that has the matching permission', async () => {
    requireOnRoute({ module: PermissionModule.MISSIONS, action: 'update' });
    userWithRole('back office');
    prisma.permission.findUnique.mockResolvedValue({
      canRead: true,
      canUpdate: true,
    });

    await expect(guard.canActivate(contextFor({ sub: 1 }))).resolves.toBe(true);
    expect(prisma.permission.findUnique).toHaveBeenCalledWith({
      where: {
        roleId_module: { roleId: 5, module: PermissionModule.MISSIONS },
      },
    });
  });

  it('denies a non-admin role that has the module but not that action', async () => {
    requireOnRoute({ module: PermissionModule.MISSIONS, action: 'delete' });
    userWithRole('back office');
    prisma.permission.findUnique.mockResolvedValue({
      canRead: true,
      canDelete: false,
    });

    await expect(
      guard.canActivate(contextFor({ sub: 1 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies a non-admin role with no permission row for the module', async () => {
    requireOnRoute({ module: PermissionModule.MISSIONS, action: 'read' });
    userWithRole('front office');
    prisma.permission.findUnique.mockResolvedValue(null);

    await expect(
      guard.canActivate(contextFor({ sub: 1 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('denies a user without a role', async () => {
    requireOnRoute({ module: PermissionModule.MISSIONS, action: 'read' });
    prisma.users.findUnique.mockResolvedValue({ id: 1, roles: null });

    await expect(
      guard.canActivate(contextFor({ sub: 1 })),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});
