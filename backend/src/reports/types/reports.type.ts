export type CurrencyBreakdown = { MAD: number; EUR: number };

export interface DriverReportRow {
  driverId: number;
  driverName: string;
  missionCount: number;
  // true when the driver is soft-deleted but still had missions in the
  // requested range — kept in the report rather than silently dropped.
  archived: boolean;
}

export interface TruckReportRow {
  truckId: number;
  plateNumber: string;
  truckType: string;
  missionCount: number;
  // Billed revenue (from ClientInvoice), not booked (Mission.clientPrice) —
  // same convention as DashboardService: a mission with no invoice yet
  // contributes 0.
  revenue: CurrencyBreakdown;
  archived: boolean;
}
