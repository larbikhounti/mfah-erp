"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, Share, SquarePlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { disablePush, enablePush, getPushState, PushState } from "@/lib/driver/push";
import { apiErrorMessage } from "@/lib/driver/api";

const HINTS: Partial<Record<PushState, string>> = {
  denied: "Notifications are blocked. Allow them for this site in your phone's browser settings.",
  unsupported: "This browser can't receive notifications. Use Chrome on Android, or add the app to the home screen on iPhone.",
  disabled: "Notifications aren't set up on the server yet.",
};

/** Turns mission notifications on/off for this phone. */
export function PushNotificationsCard() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getPushState().then(setState).catch(() => setState("unsupported"));
  }, []);

  const toggle = async (on: boolean) => {
    setBusy(true);
    try {
      const next = on ? await enablePush() : await disablePush();
      setState(next);
      if (on && next === "on") toast.success("Notifications enabled");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Could not change notifications"));
    } finally {
      setBusy(false);
    }
  };

  if (state === null) return null;

  if (state === "needs-install") {
    return (
      <div className="space-y-2 rounded-xl border bg-card p-4 text-sm">
        <p className="flex items-center gap-2 font-medium">
          <Bell className="size-4" /> Get mission notifications
        </p>
        <p className="text-muted-foreground">On iPhone, add MFAH Flow to your home screen first:</p>
        <ol className="space-y-1 text-muted-foreground">
          <li className="flex items-center gap-2">
            1. Tap <Share className="size-4" /> Share in Safari
          </li>
          <li className="flex items-center gap-2">
            2. Tap <SquarePlus className="size-4" /> Add to Home Screen
          </li>
          <li>3. Open MFAH Flow from the home screen and come back here</li>
        </ol>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {state === "on" ? <Bell className="size-5 text-primary" /> : <BellOff className="size-5 text-muted-foreground" />}
          <div>
            <p className="font-medium">Notifications</p>
            <p className="text-xs text-muted-foreground">New, changed or cancelled missions</p>
          </div>
        </div>
        {(state === "on" || state === "off") && (
          <Switch checked={state === "on"} disabled={busy} onCheckedChange={toggle} />
        )}
      </div>
      {HINTS[state] && <p className="text-xs text-muted-foreground">{HINTS[state]}</p>}
    </div>
  );
}

/** Compact call-to-action shown on Home until notifications are on. */
export function PushNotificationsPrompt() {
  const [state, setState] = useState<PushState | null>(null);

  useEffect(() => {
    getPushState().then(setState).catch(() => setState(null));
  }, []);

  if (state !== "off") return null;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3 text-sm">
      <Bell className="size-5 shrink-0 text-primary" />
      <span className="flex-1">Get notified when you have a new mission.</span>
      <Button
        size="sm"
        onClick={async () => {
          try {
            setState(await enablePush());
          } catch (error) {
            toast.error(apiErrorMessage(error, "Could not enable notifications"));
          }
        }}
      >
        Enable
      </Button>
    </div>
  );
}
