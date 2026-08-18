import { DriverStatus } from '@prisma/client';

export interface DriverResponse {
  id: number;
  fullName: string;
  cin: string;
  phone: string;
  status: DriverStatus;
  note?: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
