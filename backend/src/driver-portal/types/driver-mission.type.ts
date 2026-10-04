import {
  AttachmentCategory,
  MissionStatus,
  TransportType,
} from '@prisma/client';
import { FuelTotals } from '../../fuel-entries/types/fuel-entry-response.type';

/**
 * A mission as the driver sees it. Deliberately a separate shape from the
 * staff MissionResponse: no client, prices, costs, or invoices ever reach
 * the driver's phone.
 */
export interface DriverMission {
  id: number;
  reference: string;
  status: MissionStatus;
  transportType: TransportType;
  loadingLocation: string;
  deliveryLocation: string;
  missionDate: Date;
  expectedDeliveryDate: Date | null;
  goods: string | null;
  weightKg: number | null;
  clientReference: string | null;
  truck: { id: number; plateNumber: string } | null;
  loadingConfirmedAt: Date | null;
  completedAt: Date | null;
  completionComment: string | null;
}

/** An uploaded file, without server-side storage details. */
export interface DriverFile {
  id: number;
  category: AttachmentCategory | null;
  label: string;
  fileName: string;
  mimeType: string | null;
  fileSize: number | null;
  uploadedAt: Date;
}

export interface DriverMissionDetail extends DriverMission {
  closureFiles: DriverFile[];
  fuelTotals: FuelTotals;
  fuelEntryCount: number;
}

export interface DriverMissionCounts {
  active: number;
  upcoming: number;
  completed: number;
}

export interface DriverMissionsOverview {
  counts: DriverMissionCounts;
  active: DriverMission[];
  upcoming: DriverMission[];
  recentCompleted: DriverMission[];
}

export interface DriverFuelEntry {
  id: number;
  missionId: number;
  missionReference: string;
  litres: string;
  unitPrice: string;
  currency: string;
  totalAmount: string;
  odometerKm: number;
  createdAt: Date;
  receipt: DriverFile | null;
}
