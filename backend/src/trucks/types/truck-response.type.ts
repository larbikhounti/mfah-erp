import { TruckStatus } from '@prisma/client';

export interface TruckResponse {
  id: number;
  plateNumber: string;
  type: string;
  ptac: number;
  status: TruckStatus;
  note?: string | null;
  insuranceExpiry: Date;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}
