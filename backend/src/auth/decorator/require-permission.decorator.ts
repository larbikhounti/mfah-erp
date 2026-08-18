import { SetMetadata } from '@nestjs/common';
import { PermissionModule } from '@prisma/client';

export const PERMISSION_KEY = 'requiredPermission';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete';

export interface RequiredPermission {
  module: PermissionModule;
  action: PermissionAction;
}

/**
 * Marks a route as requiring a specific action on a specific module.
 * Checked by `PermissionGuard` against the requesting user's role — the
 * `admin` role always bypasses this check (see `AdminRoleGuard`'s equivalent
 * superuser behavior).
 */
export const RequirePermission = (
  module: PermissionModule,
  action: PermissionAction,
) =>
  SetMetadata(PERMISSION_KEY, { module, action } satisfies RequiredPermission);
