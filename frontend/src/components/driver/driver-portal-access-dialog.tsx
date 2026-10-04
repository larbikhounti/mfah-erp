"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { KeyRound, Lock, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader } from "@/components/loader";
import { useDriversStore, type Driver, type PortalAccess } from "@/stores/drivers-store";

const PIN_LENGTH = 6;

const randomPin = () =>
  Array.from(crypto.getRandomValues(new Uint32Array(PIN_LENGTH)), (n) => n % 10).join("");

/**
 * Gives a driver access to the driver portal (phone number + PIN), resets
 * their PIN, or revokes access. Resetting/revoking signs the driver out of
 * every phone immediately.
 */
export function DriverPortalAccessDialog({ driver }: { driver: Driver }) {
  const { getPortalAccess, setPortalPin, revokePortalAccess } = useDriversStore();
  const [isOpen, setIsOpen] = useState(false);
  const [access, setAccess] = useState<PortalAccess | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedPin, setSavedPin] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setPin("");
    setError("");
    setSavedPin(null);
    getPortalAccess(driver.id)
      .then(setAccess)
      .catch(() => toast.error("Failed to load portal access"));
  }, [isOpen, driver.id, getPortalAccess]);

  const save = async () => {
    if (!new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin)) {
      setError(`The PIN must be exactly ${PIN_LENGTH} digits`);
      return;
    }
    setSaving(true);
    try {
      setAccess(await setPortalPin(driver.id, pin));
      setSavedPin(pin);
      setPin("");
      toast.success(access?.enabled ? "PIN reset" : "Portal access granted");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save the PIN");
    } finally {
      setSaving(false);
    }
  };

  const revoke = async () => {
    setSaving(true);
    try {
      setAccess(await revokePortalAccess(driver.id));
      setSavedPin(null);
      toast.success("Portal access revoked");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to revoke access");
    } finally {
      setSaving(false);
    }
  };

  const locked = access?.lockedUntil && new Date(access.lockedUntil) > new Date();

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <span className="relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden">
          <Smartphone className="mr-2 h-4 w-4" />
          Portal Access
        </span>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Driver Portal — {driver.fullName}</DialogTitle>
          <DialogDescription>
            The driver signs in on their phone with their phone number and a {PIN_LENGTH}-digit PIN.
          </DialogDescription>
        </DialogHeader>

        {!access ? (
          <div className="flex justify-center py-6">
            <Loader size={18} />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {access.enabled ? <Badge>Access enabled</Badge> : <Badge variant="outline">No access</Badge>}
              {locked && (
                <Badge variant="destructive">
                  <Lock className="h-3 w-3" /> Locked (too many wrong PINs)
                </Badge>
              )}
            </div>
            {access.enabled && (
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>Login phone: {driver.phone}</p>
                <p>Last login: {access.lastLoginAt ? new Date(access.lastLoginAt).toLocaleString() : "never"}</p>
              </div>
            )}

            {savedPin && (
              <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm">
                Give this PIN to the driver: <span className="font-mono text-lg font-bold tracking-widest">{savedPin}</span>
                <p className="text-xs text-muted-foreground">It won&apos;t be shown again.</p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="portal-pin">{access.enabled ? "New PIN" : "PIN"}</Label>
              <div className="flex gap-2">
                <Input
                  id="portal-pin"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={PIN_LENGTH}
                  placeholder={"•".repeat(PIN_LENGTH)}
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value.replace(/\D/g, ""));
                    setError("");
                  }}
                  className={`font-mono tracking-widest ${error ? "border-destructive" : ""}`}
                />
                <Button type="button" variant="outline" onClick={() => setPin(randomPin())}>
                  Generate
                </Button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              {access.enabled && (
                <p className="text-xs text-muted-foreground">Resetting the PIN also unlocks the account and signs the driver out.</p>
              )}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          {access?.enabled ? (
            <Button variant="outline" className="text-destructive" onClick={revoke} disabled={saving}>
              Revoke access
            </Button>
          ) : (
            <span />
          )}
          <Button onClick={save} disabled={saving || !access}>
            <KeyRound className="mr-2 h-4 w-4" />
            {access?.enabled ? "Reset PIN" : "Give access"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
