import { PermissionModule } from '@prisma/client';

export interface PermissionResponse {
  id: number;
  roleId: number;
  module: PermissionModule;
  canCreate: boolean;
  canRead: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}
