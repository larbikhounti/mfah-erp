"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/** Navy top bar with a back button, used on every screen below a tab. */
export function DriverPageHeader({ title, backHref }: { title: string; backHref?: string }) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-brand pt-[env(safe-area-inset-top)] text-brand-foreground">
      <div className="flex h-14 items-center gap-2 px-2">
        <button
          type="button"
          onClick={() => (backHref ? router.push(backHref) : router.back())}
          className="flex items-center gap-1 rounded-md px-2 py-2 text-sm hover:bg-white/10"
        >
          <ArrowLeft className="size-5" />
          Back
        </button>
        <h1 className="flex-1 truncate pr-16 text-center text-base font-semibold">{title}</h1>
      </div>
    </header>
  );
}
