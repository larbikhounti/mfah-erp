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
  exchangeRate: Decimal | null;
  subcontractorId: number | null;
  subcontractorCost: Decimal | null;
  truckId: number | null;
  driverId: number | null;
  contractorTruckId: number | null;
  status: MissionStatus;
  missionDate: Date;
  expectedDeliveryDate: Date | null;
  goods: string | null;
  weightKg: number | null;
  clientReference: string | null;
  loadingConfirmedAt: Date | null;
  completedAt: Date | null;
  completionComment: string | null;
  reviewedAt: Date | null;
  autoInvoice: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
