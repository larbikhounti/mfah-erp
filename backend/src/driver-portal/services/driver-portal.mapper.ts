import { Mission, Truck } from '@prisma/client';
import { AttachmentResponse } from '../../attachments/types/attachment-response.type';
import { FuelEntryResponse } from '../../fuel-entries/types/fuel-entry-response.type';
import {
  DriverFile,
  DriverFuelEntry,
  DriverMission,
} from '../types/driver-mission.type';

export type MissionWithTruck = Mission & {
  truck: Pick<Truck, 'id' | 'plateNumber'> | null;
};

/** Prisma include that fetches just what DriverMission needs from Truck. */
export const TRUCK_SUMMARY = {
  truck: { select: { id: true, plateNumber: true } },
} as const;

export function toDriverMission(mission: MissionWithTruck): DriverMission {
  return {
    id: mission.id,
    reference: mission.reference,
    status: mission.status,
    transportType: mission.transportType,
    loadingLocation: mission.loadingLocation,
    deliveryLocation: mission.deliveryLocation,
    missionDate: mission.missionDate,
    expectedDeliveryDate: mission.expectedDeliveryDate,
    goods: mission.goods,
    weightKg: mission.weightKg,
    clientReference: mission.clientReference,
    truck: mission.truck,
    loadingConfirmedAt: mission.loadingConfirmedAt,
    completedAt: mission.completedAt,
    completionComment: mission.completionComment,
  };
}

export function toDriverFile(attachment: AttachmentResponse): DriverFile {
  return {
    id: attachment.id,
    category: attachment.category,
    label: attachment.label,
    fileName: attachment.fileName,
    mimeType: attachment.mimeType,
    fileSize: attachment.fileSize,
    uploadedAt: attachment.uploadedAt,
  };
}

export function toDriverFuelEntry(
  entry: FuelEntryResponse,
  missionReference: string,
): DriverFuelEntry {
  return {
    id: entry.id,
    missionId: entry.missionId,
    missionReference,
    litres: entry.litres.toFixed(2),
    unitPrice: entry.unitPrice.toFixed(3),
    currency: entry.currency,
    totalAmount: entry.totalAmount.toFixed(2),
    odometerKm: entry.odometerKm,
    createdAt: entry.createdAt,
    receipt: entry.receipt ? toDriverFile(entry.receipt) : null,
  };
}
