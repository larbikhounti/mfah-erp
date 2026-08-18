import {
  Currency,
  ExecutionMode,
  MissionStatus,
  TransportType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface MissionResponse {
  id: number;
  reference: string;
  clientId: number;
  transportType: TransportType;
  executionMode: ExecutionMode;
  loadingLocation: string;
  deliveryLocation: string;
  clientPrice: Decimal;
  currency: Currency;
  subcontractorId: number | null;
  subcontractorCost: Decimal | null;
  truckId: number | null;
  driverId: number | null;
  status: MissionStatus;
  missionDate: Date;
  autoInvoice: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
