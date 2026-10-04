"use client";

import { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader } from "@/components/loader";
import { DriverPageHeader } from "@/components/driver-portal/driver-page-header";
import { PhotoPicker } from "@/components/driver-portal/photo-picker";
import { FuelEntryRow } from "@/components/driver-portal/fuel-entry-row";
import { apiErrorMessage } from "@/lib/driver/api";
import { DriverFuelEntry, FuelCurrency, useDriverFuelStore } from "@/stores/driver-fuel-store";

interface FuelForm {
  litres: string;
  unitPrice: string;
  currency: FuelCurrency;
  odometerKm: string;
}

const EMPTY_FORM: FuelForm = { litres: "", unitPrice: "", currency: "EUR", odometerKm: "" };

/** Accepts both "1.12" and "1,12" (French keyboards). */
const parseNumber = (value: string) => Number(value.replace(",", ".").replace(/\s/g, ""));

function validate(form: FuelForm) {
  const errors: Partial<Record<keyof FuelForm, string>> = {};
  if (!(parseNumber(form.litres) > 0)) errors.litres = "Enter the litres";
  if (!(parseNumber(form.unitPrice) > 0)) errors.unitPrice = "Enter the price per litre";
  if (!form.odometerKm || !Number.isInteger(parseNumber(form.odometerKm))) errors.odometerKm = "Enter the kilometres";
  return errors;
}

export default function DriverAddFuelPage({ params }: { params: Promise<{ id: string }> }) {
  const missionId = Number(use(params).id);
  const { entries, fetchEntries, addEntry, deleteEntry } = useDriverFuelStore();
  const [form, setForm] = useState<FuelForm>(EMPTY_FORM);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [errors, setErrors] = useState<ReturnType<typeof validate>>({});
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<DriverFuelEntry | null>(null);

  useEffect(() => {
    fetchEntries(missionId).catch(() => undefined);
  }, [missionId, fetchEntries]);

  const total = parseNumber(form.litres) * parseNumber(form.unitPrice);
  const set = (key: keyof FuelForm) => (value: string) => setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await addEntry(missionId, {
        litres: parseNumber(form.litres),
        unitPrice: parseNumber(form.unitPrice),
        currency: form.currency,
        odometerKm: parseNumber(form.odometerKm),
        receipt,
      });
      toast.success("Fuel saved");
      setForm((f) => ({ ...EMPTY_FORM, currency: f.currency }));
      setReceipt(null);
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not save fuel"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DriverPageHeader title="Add fuel" backHref={`/driver/missions/${missionId}`} />

      <div className="space-y-4 p-4">
        <section className="space-y-4 rounded-xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <Fuel className="size-9 text-brand dark:text-primary" />
            <div>
              <h2 className="text-lg font-bold">Add fuel</h2>
              <p className="text-sm text-muted-foreground">Enter each refuel you make during this mission.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="litres">Litres *</Label>
            <div className="relative">
              <Input id="litres" inputMode="decimal" value={form.litres} onChange={(e) => set("litres")(e.target.value)} className="h-12 pr-10 text-lg" />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">L</span>
            </div>
            {errors.litres && <p className="text-xs text-destructive">{errors.litres}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="unitPrice">Unit price *</Label>
            <div className="flex gap-2">
              <Input id="unitPrice" inputMode="decimal" value={form.unitPrice} onChange={(e) => set("unitPrice")(e.target.value)} className="h-12 flex-1 text-lg" />
              <Select value={form.currency} onValueChange={(v) => set("currency")(v)}>
                <SelectTrigger className="!h-12 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="MAD">MAD</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {errors.unitPrice && <p className="text-xs text-destructive">{errors.unitPrice}</p>}
          </div>

          <div className="flex items-end justify-between rounded-lg bg-primary/10 p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total amount</p>
              <p className="text-3xl font-bold">{Number.isFinite(total) && total > 0 ? total.toFixed(2) : "0.00"}</p>
            </div>
            <span className="font-medium">{form.currency}</span>
          </div>

          <div className="space-y-2">
            <Label htmlFor="km">Kilometres (KM) *</Label>
            <div className="relative">
              <Input id="km" inputMode="numeric" value={form.odometerKm} onChange={(e) => set("odometerKm")(e.target.value)} className="h-12 pr-12 text-lg" />
              <span className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground">KM</span>
            </div>
            {errors.odometerKm && <p className="text-xs text-destructive">{errors.odometerKm}</p>}
          </div>

          <div className="space-y-2">
            <Label>Receipt photo (optional)</Label>
            <PhotoPicker file={receipt} onChange={setReceipt} label="Add a photo of the receipt" className="h-36 w-full" />
          </div>

          <Button size="lg" className="h-14 w-full text-base" onClick={save} disabled={saving}>
            {saving ? <Loader size={18} /> : "Save fuel"}
          </Button>
        </section>

        {entries.length > 0 && (
          <section className="rounded-xl border bg-card px-4 pt-4">
            <h3 className="font-semibold">Recent fuel entries (this mission)</h3>
            <div className="divide-y">
              {entries.map((entry) => (
                <FuelEntryRow key={entry.id} entry={entry} onDelete={setToDelete} />
              ))}
            </div>
          </section>
        )}
      </div>

      <AlertDialog open={!!toDelete} onOpenChange={(open) => !open && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this fuel entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && `${Number(toDelete.litres)} L — ${toDelete.totalAmount} ${toDelete.currency}`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!toDelete) return;
                try {
                  await deleteEntry(toDelete.id, missionId);
                  toast.success("Fuel entry deleted");
                } catch (error) {
                  toast.error(apiErrorMessage(error));
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
