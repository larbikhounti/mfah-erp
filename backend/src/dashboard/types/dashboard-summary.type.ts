import { DriverStatus, MissionStatus, TruckStatus } from '@prisma/client';

export type CurrencyBreakdown = { MAD: number; EUR: number };

export interface MissionSummaryRow {
  id: number;
  reference: string;
  clientId: number;
  clientName: string;
  transportType: string;
  executionMode: string;
  status: MissionStatus;
  clientPrice: string;
  currency: string;
  missionDate: Date;
  clientInvoiceStatus: string | null;
  subcontractorBillStatus: string | null;
}

export interface DashboardSummaryResponse {
  missionTotal: number;
  missionsByStatus: Record<MissionStatus, number>;
  revenue: CurrencyBreakdown;
  outstanding: CurrencyBreakdown;
  subcontractorSpend: CurrencyBreakdown;
  subcontractorOutstanding: CurrencyBreakdown;
  fleetStatus: Record<TruckStatus, number>;
  driverStatus: Record<DriverStatus, number>;
  overdueClientInvoices: number;
  overdueSubcontractorBills: number;
  missions: {
    data: MissionSummaryRow[];
    total: number;
  };
}
