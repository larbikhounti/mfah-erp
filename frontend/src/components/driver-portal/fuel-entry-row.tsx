"use client";

import { Fuel, Trash2 } from "lucide-react";
import type { DriverFuelEntry } from "@/stores/driver-fuel-store";
import { formatDateTime, formatMoney, formatNumber } from "@/lib/driver/format";
import { FileThumbnail } from "./file-thumbnail";

interface FuelEntryRowProps {
  entry: DriverFuelEntry;
  showMission?: boolean;
  onDelete?: (entry: DriverFuelEntry) => void;
}

export function FuelEntryRow({ entry, showMission, onDelete }: FuelEntryRowProps) {
  return (
    <div className="flex items-center gap-3 py-3">
      {entry.receipt ? (
        <FileThumbnail file={entry.receipt} className="size-12 shrink-0" />
      ) : (
        <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-muted">
          <Fuel className="size-5 text-muted-foreground" />
        </div>
      )}
      <div className="min-w-0 flex-1 text-sm">
        <p>{formatDateTime(entry.createdAt)}</p>
        <p className="text-muted-foreground">
          {formatNumber(entry.litres, 0)} L
          {showMission && ` · ${entry.missionReference}`}
        </p>
      </div>
      <div className="text-right text-sm">
        <p className="font-medium">{formatMoney(entry.totalAmount, entry.currency)}</p>
        <p className="text-xs text-muted-foreground">KM: {formatNumber(entry.odometerKm)}</p>
      </div>
      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(entry)}
          aria-label="Delete fuel entry"
          className="rounded-md p-1.5 text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-4" />
        </button>
      )}
    </div>
  );
}
