"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { useRemoteComboboxOptions } from "@/hooks/use-remote-combobox-options";
import { Plus, Route } from "lucide-react";
import {
  useMissionsStore,
  type CreateMissionPayload,
  type ExecutionMode,
  type TransportType,
  type Currency,
} from "@/stores/missions-store";
import type { Client } from "@/stores/clients-store";
import type { Subcontractor } from "@/stores/subcontractors-store";
import { useTrucksStore } from "@/stores/trucks-store";
import { useDriversStore } from "@/stores/drivers-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateMissionDialogProps {
  trigger?: React.ReactNode;
}

const TRANSPORT_OPTIONS: TransportType[] = ["EXPORT", "IMPORT"];
const CURRENCY_OPTIONS: Currency[] = ["MAD", "EUR"];

export function CreateMissionDialog({ trigger }: CreateMissionDialogProps) {
  const { createMission, loading } = useMissionsStore();
  const { trucks, fetchTrucks } = useTrucksStore();
  const { drivers, fetchDrivers } = useDriversStore();

  const mapClient = useCallback((c: Client) => ({ value: c.id.toString(), label: c.companyName }), []);
  const {
    options: clientOptions,
    loading: clientsLoading,
    search: searchClients,
  } = useRemoteComboboxOptions<Client>({ endpoint: "/clients", mapItem: mapClient });

  const mapSubcontractor = useCallback(
    (s: Subcontractor) => ({ value: s.id.toString(), label: s.companyName }),
    []
  );
  const {
    options: subcontractorOptions,
    loading: subcontractorsLoading,
    search: searchSubcontractors,
  } = useRemoteComboboxOptions<Subcontractor>({ endpoint: "/subcontractors", mapItem: mapSubcontractor });

  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [clientLabel, setClientLabel] = useState("");
  const [transportType, setTransportType] = useState<TransportType>("EXPORT");
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("IN_HOUSE");
  const [loadingLocation, setLoadingLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [clientPrice, setClientPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("MAD");
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [subcontractorId, setSubcontractorId] = useState("");
  const [subcontractorLabel, setSubcontractorLabel] = useState("");
  const [subcontractorCost, setSubcontractorCost] = useState("");
  const [missionDate, setMissionDate] = useState("");
  const [autoInvoice, setAutoInvoice] = useState(true);
  const [confirmNoInvoiceOpen, setConfirmNoInvoiceOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchTrucks({ limit: 100 });
      fetchDrivers({ limit: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetForm = () => {
    setClientId("");
    setClientLabel("");
    setTransportType("EXPORT");
    setExecutionMode("IN_HOUSE");
    setLoadingLocation("");
    setDeliveryLocation("");
    setClientPrice("");
    setCurrency("MAD");
    setTruckId("");
    setDriverId("");
    setSubcontractorId("");
    setSubcontractorLabel("");
    setSubcontractorCost("");
    setMissionDate("");
    setAutoInvoice(true);
    setErrors({});
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!clientId) newErrors.clientId = "Client is required";
    if (!loadingLocation.trim()) newErrors.loadingLocation = "Loading location is required";
    if (!deliveryLocation.trim()) newErrors.deliveryLocation = "Delivery location is required";
    if (!clientPrice || Number(clientPrice) <= 0) newErrors.clientPrice = "Client price must be positive";
    if (!missionDate) newErrors.missionDate = "Mission date is required";

    if (executionMode === "IN_HOUSE") {
      if (!truckId) newErrors.truckId = "Truck is required";
      if (!driverId) newErrors.driverId = "Driver is required";
    } else {
      if (!subcontractorId) newErrors.subcontractorId = "Subcontractor is required";
      if (!subcontractorCost || Number(subcontractorCost) <= 0)
        newErrors.subcontractorCost = "Subcontractor cost must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const payload: CreateMissionPayload = {
        clientId: Number(clientId),
        transportType,
        executionMode,
        loadingLocation: loadingLocation.trim(),
        deliveryLocation: deliveryLocation.trim(),
        clientPrice: Number(clientPrice),
        currency,
        missionDate: new Date(missionDate).toISOString(),
        autoInvoice,
        ...(executionMode === "IN_HOUSE"
          ? { truckId: Number(truckId), driverId: Number(driverId) }
          : { subcontractorId: Number(subcontractorId), subcontractorCost: Number(subcontractorCost) }),
      };
      await createMission(payload);
      toast.success("Mission created successfully");
      resetForm();
      setIsOpen(false);
    } catch (error) {
      // The store already surfaces the real backend error via its `error`
      // state, toasted by the table — no generic toast here to avoid a duplicate.
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) resetForm();
      }}
    >
      <DialogTrigger asChild>
        {trigger || (
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Mission
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Add New Mission
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client *</Label>
              <Combobox
                id="clientId"
                value={clientId}
                onChange={(value) => {
                  setClientId(value);
                  setClientLabel(clientOptions.find((o) => o.value === value)?.label ?? "");
                }}
                onSearchChange={searchClients}
                loading={clientsLoading}
                selectedLabel={clientLabel}
                placeholder="Select client"
                searchPlaceholder="Search clients..."
                emptyText="No client found."
                className={errors.clientId ? "border-destructive" : ""}
                options={clientOptions}
              />
              {errors.clientId && <p className="text-sm text-destructive">{errors.clientId}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="transportType">Transport Type</Label>
              <Select value={transportType} onValueChange={(v) => setTransportType(v as TransportType)}>
                <SelectTrigger id="transportType" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRANSPORT_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="loadingLocation">Loading Location *</Label>
              <Input
                id="loadingLocation"
                value={loadingLocation}
                onChange={(e) => setLoadingLocation(e.target.value)}
                placeholder="Tanger Med"
                className={errors.loadingLocation ? "border-destructive" : ""}
              />
              {errors.loadingLocation && <p className="text-sm text-destructive">{errors.loadingLocation}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliveryLocation">Delivery Location *</Label>
              <Input
                id="deliveryLocation"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                placeholder="Rotterdam"
                className={errors.deliveryLocation ? "border-destructive" : ""}
              />
              {errors.deliveryLocation && <p className="text-sm text-destructive">{errors.deliveryLocation}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="clientPrice">Client Price *</Label>
              <Input
                id="clientPrice"
                type="number"
                min={0}
                value={clientPrice}
                onChange={(e) => setClientPrice(e.target.value)}
                className={errors.clientPrice ? "border-destructive" : ""}
              />
              {errors.clientPrice && <p className="text-sm text-destructive">{errors.clientPrice}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="missionDate">Mission Date *</Label>
              <Input
                id="missionDate"
                type="date"
                value={missionDate}
                onChange={(e) => setMissionDate(e.target.value)}
                className={errors.missionDate ? "border-destructive" : ""}
              />
              {errors.missionDate && <p className="text-sm text-destructive">{errors.missionDate}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="executionMode">Execution Mode</Label>
            <Select value={executionMode} onValueChange={(v) => setExecutionMode(v as ExecutionMode)}>
              <SelectTrigger id="executionMode" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="IN_HOUSE">In-house (our own truck &amp; driver)</SelectItem>
                <SelectItem value="SUBCONTRACTED">Subcontracted</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {executionMode === "IN_HOUSE" ? (
            <div className="grid gap-4 md:grid-cols-2 rounded-md border p-4">
              <div className="grid gap-2">
                <Label htmlFor="truckId">Truck *</Label>
                <Combobox
                  id="truckId"
                  value={truckId}
                  onChange={setTruckId}
                  placeholder="Select truck"
                  searchPlaceholder="Search trucks..."
                  emptyText="No truck found."
                  className={errors.truckId ? "border-destructive" : ""}
                  options={trucks.map((t) => ({ value: t.id.toString(), label: `${t.plateNumber} (${t.status})` }))}
                />
                {errors.truckId && <p className="text-sm text-destructive">{errors.truckId}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driverId">Driver *</Label>
                <Combobox
                  id="driverId"
                  value={driverId}
                  onChange={setDriverId}
                  placeholder="Select driver"
                  searchPlaceholder="Search drivers..."
                  emptyText="No driver found."
                  className={errors.driverId ? "border-destructive" : ""}
                  options={drivers.map((d) => ({ value: d.id.toString(), label: `${d.fullName} (${d.status})` }))}
                />
                {errors.driverId && <p className="text-sm text-destructive">{errors.driverId}</p>}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 rounded-md border p-4">
              <div className="grid gap-2">
                <Label htmlFor="subcontractorId">Subcontractor *</Label>
                <Combobox
                  id="subcontractorId"
                  value={subcontractorId}
                  onChange={(value) => {
                    setSubcontractorId(value);
                    setSubcontractorLabel(subcontractorOptions.find((o) => o.value === value)?.label ?? "");
                  }}
                  onSearchChange={searchSubcontractors}
                  loading={subcontractorsLoading}
                  selectedLabel={subcontractorLabel}
                  placeholder="Select subcontractor"
                  searchPlaceholder="Search subcontractors..."
                  emptyText="No subcontractor found."
                  className={errors.subcontractorId ? "border-destructive" : ""}
                  options={subcontractorOptions}
                />
                {errors.subcontractorId && <p className="text-sm text-destructive">{errors.subcontractorId}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subcontractorCost">Subcontractor Cost *</Label>
                <Input
                  id="subcontractorCost"
                  type="number"
                  min={0}
                  value={subcontractorCost}
                  onChange={(e) => setSubcontractorCost(e.target.value)}
                  className={errors.subcontractorCost ? "border-destructive" : ""}
                />
                {errors.subcontractorCost && (
                  <p className="text-sm text-destructive">{errors.subcontractorCost}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="autoInvoice"
              checked={autoInvoice}
              onCheckedChange={(checked) => {
                if (checked === true) {
                  setAutoInvoice(true);
                } else {
                  setConfirmNoInvoiceOpen(true);
                }
              }}
            />
            <Label htmlFor="autoInvoice" className="text-sm font-normal">
              Automatically create the client invoice for this mission
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <span className="flex items-center">
                  <Loader size={16} />
                  <span className="ml-2">Creating...</span>
                </span>
              ) : (
                "Create Mission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={confirmNoInvoiceOpen} onOpenChange={setConfirmNoInvoiceOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn off automatic invoicing?</AlertDialogTitle>
            <AlertDialogDescription>
              The client invoice won&apos;t be created for this mission. You&apos;ll need to create it manually
              afterwards from the Invoices section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it on</AlertDialogCancel>
            <AlertDialogAction onClick={() => setAutoInvoice(false)}>Turn off</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
