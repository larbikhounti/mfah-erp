"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Plus, Route } from "lucide-react";
import {
  useMissionsStore,
  type CreateMissionPayload,
  type ExecutionMode,
  type TransportType,
  type Currency,
} from "@/stores/missions-store";
import { useClientsStore } from "@/stores/clients-store";
import { useTrucksStore } from "@/stores/trucks-store";
import { useDriversStore } from "@/stores/drivers-store";
import { useSubcontractorsStore } from "@/stores/subcontractors-store";
import { toast } from "sonner";
import { Loader } from "../loader";

interface CreateMissionDialogProps {
  trigger?: React.ReactNode;
}

const TRANSPORT_OPTIONS: TransportType[] = ["EXPORT", "IMPORT"];
const CURRENCY_OPTIONS: Currency[] = ["MAD", "EUR"];

export function CreateMissionDialog({ trigger }: CreateMissionDialogProps) {
  const { createMission, loading } = useMissionsStore();
  const { clients, fetchClients } = useClientsStore();
  const { trucks, fetchTrucks } = useTrucksStore();
  const { drivers, fetchDrivers } = useDriversStore();
  const { subcontractors, fetchSubcontractors } = useSubcontractorsStore();

  const [isOpen, setIsOpen] = useState(false);
  const [clientId, setClientId] = useState("");
  const [transportType, setTransportType] = useState<TransportType>("EXPORT");
  const [executionMode, setExecutionMode] = useState<ExecutionMode>("IN_HOUSE");
  const [loadingLocation, setLoadingLocation] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [clientPrice, setClientPrice] = useState("");
  const [currency, setCurrency] = useState<Currency>("MAD");
  const [truckId, setTruckId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [subcontractorId, setSubcontractorId] = useState("");
  const [subcontractorCost, setSubcontractorCost] = useState("");
  const [missionDate, setMissionDate] = useState("");
  const [autoInvoice, setAutoInvoice] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      fetchClients({ limit: 100 });
      fetchTrucks({ limit: 100 });
      fetchDrivers({ limit: 100 });
      fetchSubcontractors({ limit: 100 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetForm = () => {
    setClientId("");
    setTransportType("EXPORT");
    setExecutionMode("IN_HOUSE");
    setLoadingLocation("");
    setDeliveryLocation("");
    setClientPrice("");
    setCurrency("MAD");
    setTruckId("");
    setDriverId("");
    setSubcontractorId("");
    setSubcontractorCost("");
    setMissionDate("");
    setAutoInvoice(false);
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
      toast.error("Failed to create mission");
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
          <DialogDescription>Book a new transport mission.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="clientId">Client *</Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger id="clientId" className={"w-full" + (errors.clientId ? " border-destructive" : "")}>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Select value={truckId} onValueChange={setTruckId}>
                  <SelectTrigger id="truckId" className={"w-full" + (errors.truckId ? " border-destructive" : "")}>
                    <SelectValue placeholder="Select truck" />
                  </SelectTrigger>
                  <SelectContent>
                    {trucks.map((t) => (
                      <SelectItem key={t.id} value={t.id.toString()}>
                        {t.plateNumber} ({t.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.truckId && <p className="text-sm text-destructive">{errors.truckId}</p>}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="driverId">Driver *</Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger id="driverId" className={"w-full" + (errors.driverId ? " border-destructive" : "")}>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((d) => (
                      <SelectItem key={d.id} value={d.id.toString()}>
                        {d.fullName} ({d.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.driverId && <p className="text-sm text-destructive">{errors.driverId}</p>}
              </div>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 rounded-md border p-4">
              <div className="grid gap-2">
                <Label htmlFor="subcontractorId">Subcontractor *</Label>
                <Select value={subcontractorId} onValueChange={setSubcontractorId}>
                  <SelectTrigger
                    id="subcontractorId"
                    className={"w-full" + (errors.subcontractorId ? " border-destructive" : "")}
                  >
                    <SelectValue placeholder="Select subcontractor" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcontractors.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.companyName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              onCheckedChange={(checked) => setAutoInvoice(checked === true)}
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
    </Dialog>
  );
}
