import { Users } from '@prisma/client';

export interface UserResponse extends Omit<Users, 'password'> {
  roles?: {
    id: number;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  } | null;
  doms?: {
    id: number;
    name: string;
    address: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  } | null;
}
