import { Currency } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { AttachmentResponse } from '../../attachments/types/attachment-response.type';

export interface FuelEntryResponse {
  id: number;
  missionId: number;
  driverId: number;
  truckId: number | null;
  litres: Decimal;
  unitPrice: Decimal;
  currency: Currency;
  totalAmount: Decimal;
  odometerKm: number;
  createdAt: Date;
  updatedAt: Date;
  /** Optional photo of the pump receipt, for ops to verify the entry. */
  receipt: AttachmentResponse | null;
}

/** Totals per currency — drivers refuel in both EUR (Spain) and MAD. */
export type FuelTotals = Partial<
  Record<Currency, { amount: string; litres: string; entries: number }>
>;

export interface FuelEntriesWithTotals {
  data: FuelEntryResponse[];
  total: number;
  totals: FuelTotals;
}
