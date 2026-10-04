"use client";

import { Delete } from "lucide-react";
import { cn } from "@/lib/utils";

export const PIN_LENGTH = 6;

const KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "back"];

interface PinKeypadProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: boolean;
}

/** Phone-style PIN entry: dots + big digit keys (no system keyboard). */
export function PinKeypad({ value, onChange, disabled, error }: PinKeypadProps) {
  const press = (key: string) => {
    if (disabled) return;
    if (key === "back") onChange(value.slice(0, -1));
    else if (value.length < PIN_LENGTH) onChange(value + key);
  };

  return (
    <div className="space-y-8">
      <div className={cn("flex justify-center gap-3", error && "animate-pulse")}>
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <span
            key={i}
            className={cn(
              "size-3.5 rounded-full border-2 border-brand-foreground/70",
              i < value.length && "bg-brand-foreground",
              error && "border-destructive bg-destructive",
            )}
          />
        ))}
      </div>

      <div className="mx-auto grid max-w-72 grid-cols-3 gap-4">
        {KEYS.map((key, i) =>
          key === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              onClick={() => press(key)}
              disabled={disabled}
              aria-label={key === "back" ? "Delete" : key}
              className="flex h-16 items-center justify-center rounded-full text-2xl font-medium text-brand-foreground transition-colors hover:bg-white/10 active:bg-white/20 disabled:opacity-50"
            >
              {key === "back" ? <Delete className="size-6" /> : key}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
