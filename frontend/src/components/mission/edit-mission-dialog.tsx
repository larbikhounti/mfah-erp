"use client";

import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { axiosInstance } from "@/lib/utils";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "@/components/ui/combobox";
import { useRemoteComboboxOptions } from "@/hooks/use-remote-combobox-options";
import { Edit } from "lucide-react";
import {
  useMissionsStore,
  type Mission,
  type UpdateMissionPayload,
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

interface EditMissionDialogProps {
  mission: Mission;
}

const TRANSPORT_OPTIONS: TransportType[] = ["EXPORT", "IMPORT"];
const CURRENCY_OPTIONS: Currency[] = ["MAD", "EUR"];

export function EditMissionDialog({ mission }: EditMissionDialogProps) {
  const { updateMission, loading } = useMissionsStore();
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
  const [clientId, setClientId] = useState(mission.clientId.toString());
  // The client/subcontractor pickers now search the backend live rather than
  // filtering a pre-fetched batch, so the mission's already-selected client
  // isn't necessarily in the current search results — resolve its name once
  // by id so the trigger button still shows it correctly.
  const [clientLabel, setClientLabel] = useState("");
  const [subcontractorLabel, setSubcontractorLabel] = useState("");
  const [transportType, setTransportType] = useState<TransportType>(mission.transportType);
  const [executionMode, setExecutionMode] = useState<ExecutionMode>(mission.executionMode);
  const [loadingLocation, setLoadingLocation] = useState(mission.loadingLocation);
  const [deliveryLocation, setDeliveryLocation] = useState(mission.deliveryLocation);
  const [clientPrice, setClientPrice] = useState(mission.clientPrice);
  const [currency, setCurrency] = useState<Currency>(mission.currency);
  const [truckId, setTruckId] = useState(mission.truckId?.toString() ?? "");
  const [driverId, setDriverId] = useState(mission.driverId?.toString() ?? "");
  const [subcontractorId, setSubcontractorId] = useState(mission.subcontractorId?.toString() ?? "");
  const [subcontractorCost, setSubcontractorCost] = useState(mission.subcontractorCost ?? "");
  const [missionDate, setMissionDate] = useState(mission.missionDate.slice(0, 10));
  const [autoInvoice, setAutoInvoice] = useState(mission.autoInvoice);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchTrucks({ limit: 100 });
      fetchDrivers({ limit: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    axiosInstance
      .get<Client>(`/clients/${mission.clientId}`)
      .then((res) => setClientLabel(res.data.companyName))
      .catch(() => {});
    if (mission.subcontractorId) {
      axiosInstance
        .get<Subcontractor>(`/subcontractors/${mission.subcontractorId}`)
        .then((res) => setSubcontractorLabel(res.data.companyName))
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, mission.clientId, mission.subcontractorId]);

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
      const payload: UpdateMissionPayload = {
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
      await updateMission(mission.id, payload);
      toast.success("Mission updated successfully");
      setIsOpen(false);
    } catch (error) {
      // The store already surfaces the real backend error via its `error`
      // state, toasted by the table — no generic toast here to avoid a duplicate.
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Mission {mission.reference}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="edit-clientId">Client *</Label>
              <Combobox
                id="edit-clientId"
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
              <Label htmlFor="edit-transportType">Transport Type</Label>
              <Select value={transportType} onValueChange={(v) => setTransportType(v as TransportType)}>
                <SelectTrigger id="edit-transportType" className="w-full">
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
              <Label htmlFor="edit-loadingLocation">Loading Location *</Label>
              <Input
                id="edit-loadingLocation"
                value={loadingLocation}
                onChange={(e) => setLoadingLocation(e.target.value)}
                className={errors.loadingLocation ? "border-destructive" : ""}
              />
              {errors.loadingLocation && <p className="text-sm text-destructive">{errors.loadingLocation}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-deliveryLocation">Delivery Location *</Label>
              <Input
                id="edit-deliveryLocation"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className={errors.deliveryLocation ? "border-destructive" : ""}
              />
              {errors.deliveryLocation && <p className="text-sm text-destructive">{errors.deliveryLocation}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-clientPrice">Client Price *</Label>
              <Input
                id="edit-clientPrice"
                type="number"
                min={0}
                value={clientPrice}
                onChange={(e) => setClientPrice(e.target.value)}
                className={errors.clientPrice ? "border-destructive" : ""}
              />
              {errors.clientPrice && <p className="text-sm text-destructive">{errors.clientPrice}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-currency">Currency</Label>
              <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
                <SelectTrigger id="edit-currency" className="w-full">
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
              <Label htmlFor="edit-missionDate">Mission Date *</Label>
              <Input
                id="edit-missionDate"
                type="date"
                value={missionDate}
                onChange={(e) => setMissionDate(e.target.value)}
                className={errors.missionDate ? "border-destructive" : ""}
              />
              {errors.missionDate && <p className="text-sm text-destructive">{errors.missionDate}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="edit-executionMode">Execution Mode</Label>
            <Select value={executionMode} onValueChange={(v) => setExecutionMode(v as ExecutionMode)}>
              <SelectTrigger id="edit-executionMode" className="w-full">
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
                <Label htmlFor="edit-truckId">Truck *</Label>
                <Combobox
                  id="edit-truckId"
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
                <Label htmlFor="edit-driverId">Driver *</Label>
                <Combobox
                  id="edit-driverId"
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
                <Label htmlFor="edit-subcontractorId">Subcontractor *</Label>
                <Combobox
                  id="edit-subcontractorId"
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
                <Label htmlFor="edit-subcontractorCost">Subcontractor Cost *</Label>
                <Input
                  id="edit-subcontractorCost"
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
              id="edit-autoInvoice"
              checked={autoInvoice}
              onCheckedChange={(checked) => setAutoInvoice(checked === true)}
            />
            <Label htmlFor="edit-autoInvoice" className="text-sm font-normal">
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
                  <span className="ml-2">Updating...</span>
                </span>
              ) : (
                "Update Mission"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
