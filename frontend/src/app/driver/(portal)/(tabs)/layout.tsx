import { DriverBottomNav } from "@/components/driver-portal/driver-bottom-nav";

/** The four main tabs share the bottom navigation. */
export default function DriverTabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className="pb-[calc(4.5rem+env(safe-area-inset-bottom))]">{children}</div>
      <DriverBottomNav />
    </>
  );
}
