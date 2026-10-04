"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandMark } from "@/components/driver-portal/brand-mark";
import { PIN_LENGTH, PinKeypad } from "@/components/driver-portal/pin-keypad";
import { apiErrorMessage } from "@/lib/driver/api";
import { driverSession, RememberedDriver } from "@/lib/driver/session";
import { useDriverSessionStore } from "@/stores/driver-session-store";

/**
 * Phone number + PIN. After the first login the phone is remembered, so
 * return visits go straight to the PIN keypad ("Hello Ahmed").
 */
export default function DriverLoginPage() {
  const router = useRouter();
  const { ready, profile, login } = useDriverSessionStore();
  const [remembered, setRemembered] = useState<RememberedDriver | null>(null);
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"phone" | "pin">("phone");
  const [pin, setPin] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const known = driverSession.getRemembered();
    if (known) {
      setRemembered(known);
      setPhone(known.phone);
      setStep("pin");
    }
  }, []);

  useEffect(() => {
    if (ready && profile) router.replace("/driver");
  }, [ready, profile, router]);

  const submitPin = async (fullPin: string) => {
    setSubmitting(true);
    try {
      await login(phone, fullPin);
      router.replace("/driver");
    } catch (err) {
      setError(true);
      toast.error(apiErrorMessage(err, "Login failed"));
      setTimeout(() => {
        setPin("");
        setError(false);
      }, 600);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePinChange = (next: string) => {
    setPin(next);
    if (next.length === PIN_LENGTH) submitPin(next);
  };

  const switchDriver = () => {
    driverSession.forget();
    setRemembered(null);
    setPhone("");
    setPin("");
    setStep("phone");
  };

  return (
    <main className="flex min-h-svh flex-col bg-brand px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8 text-brand-foreground">
      <BrandMark className="mb-12" />

      {step === "phone" ? (
        <form
          className="mx-auto w-full max-w-sm space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (phone.replace(/\D/g, "").length >= 9) setStep("pin");
          }}
        >
          <h1 className="text-center text-xl font-semibold">Driver login</h1>
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-brand-foreground/80">
              Phone number
            </Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12 border-white/20 bg-white/10 text-lg text-brand-foreground placeholder:text-brand-foreground/40"
              autoFocus
            />
          </div>
          <Button type="submit" size="lg" className="h-12 w-full" disabled={phone.replace(/\D/g, "").length < 9}>
            Continue
          </Button>
        </form>
      ) : (
        <div className="mx-auto w-full max-w-sm space-y-8">
          <div className="space-y-1 text-center">
            <h1 className="text-xl font-semibold">
              {remembered ? `Hello ${remembered.fullName.split(" ")[0]}` : "Enter your PIN"}
            </h1>
            <p className="text-sm text-brand-foreground/70">
              {remembered ? "Enter your PIN to continue" : phone}
            </p>
          </div>

          <PinKeypad value={pin} onChange={handlePinChange} disabled={submitting || error} error={error} />

          <button
            type="button"
            onClick={remembered ? switchDriver : () => setStep("phone")}
            className="mx-auto block text-sm text-brand-foreground/70 underline-offset-4 hover:underline"
          >
            {remembered ? "Not you? Use another phone number" : "Change phone number"}
          </button>
        </div>
      )}

      <p className="mt-auto pt-10 text-center text-xs text-brand-foreground/50">
        Forgot your PIN? Ask the operations team to reset it.
      </p>
    </main>
  );
}
