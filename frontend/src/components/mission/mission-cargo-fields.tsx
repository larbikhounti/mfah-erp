"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Mission } from "@/stores/missions-store";

/**
 * Cargo / schedule details shown to the driver in the driver portal.
 * Shared by the create and edit mission dialogs (form state stays in each
 * dialog, this only renders the inputs).
 */
export interface MissionCargoValues {
  expectedDeliveryDate: string; // yyyy-MM-dd
  goods: string;
  weightKg: string;
  clientReference: string;
}

export const EMPTY_CARGO: MissionCargoValues = {
  expectedDeliveryDate: "",
  goods: "",
  weightKg: "",
  clientReference: "",
};

export function cargoFromMission(mission: Mission): MissionCargoValues {
  return {
    expectedDeliveryDate: mission.expectedDeliveryDate ? mission.expectedDeliveryDate.slice(0, 10) : "",
    goods: mission.goods ?? "",
    weightKg: mission.weightKg !== null ? String(mission.weightKg) : "",
    clientReference: mission.clientReference ?? "",
  };
}

/** Empty inputs are sent as null so editing can clear a value. */
export function cargoToPayload(values: MissionCargoValues) {
  return {
    expectedDeliveryDate: values.expectedDeliveryDate
      ? new Date(values.expectedDeliveryDate).toISOString()
      : null,
    goods: values.goods.trim() || null,
    weightKg: values.weightKg ? Number(values.weightKg) : null,
    clientReference: values.clientReference.trim() || null,
  };
}

/** `loadingDateTime` is the dialog's datetime-local value. */
export function validateCargo(values: MissionCargoValues, loadingDateTime: string): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.weightKg && (!Number.isInteger(Number(values.weightKg)) || Number(values.weightKg) < 0)) {
    errors.weightKg = "Weight must be a whole number of kg";
  }
  if (values.expectedDeliveryDate && loadingDateTime && values.expectedDeliveryDate < loadingDateTime.slice(0, 10)) {
    errors.expectedDeliveryDate = "Delivery can't be before loading";
  }
  return errors;
}

/** ISO date → value for an <input type="datetime-local">, in local time. */
export function toDateTimeLocal(iso: string): string {
  const date = new Date(iso);
  const offsetMs = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

interface MissionCargoFieldsProps {
  values: MissionCargoValues;
  onChange: (values: MissionCargoValues) => void;
  errors: Record<string, string>;
}

export function MissionCargoFields({ values, onChange, errors }: MissionCargoFieldsProps) {
  const set = (key: keyof MissionCargoValues) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange({ ...values, [key]: e.target.value });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-2">
        <Label htmlFor="expectedDeliveryDate">Expected Delivery</Label>
        <Input
          id="expectedDeliveryDate"
          type="date"
          value={values.expectedDeliveryDate}
          onChange={set("expectedDeliveryDate")}
          className={errors.expectedDeliveryDate ? "border-destructive" : ""}
        />
        {errors.expectedDeliveryDate && <p className="text-sm text-destructive">{errors.expectedDeliveryDate}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="clientReference">Client Reference</Label>
        <Input
          id="clientReference"
          placeholder="e.g. K+N / AGC"
          maxLength={100}
          value={values.clientReference}
          onChange={set("clientReference")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="goods">Goods</Label>
        <Input
          id="goods"
          placeholder="e.g. Automotive parts"
          maxLength={200}
          value={values.goods}
          onChange={set("goods")}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="weightKg">Weight (kg)</Label>
        <Input
          id="weightKg"
          type="number"
          min={0}
          step={1}
          value={values.weightKg}
          onChange={set("weightKg")}
          className={errors.weightKg ? "border-destructive" : ""}
        />
        {errors.weightKg && <p className="text-sm text-destructive">{errors.weightKg}</p>}
      </div>
    </div>
  );
}
