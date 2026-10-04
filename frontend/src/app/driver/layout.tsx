import type { Metadata, Viewport } from "next";
import { DriverAppProviders } from "@/components/driver-portal/driver-app-providers";

export const metadata: Metadata = {
  title: "MFAH Flow — Driver",
  description: "Missions, fuel and delivery for MFAH Globalog drivers",
  manifest: "/driver.webmanifest",
  appleWebApp: { capable: true, title: "MFAH Flow", statusBarStyle: "black-translucent" },
  icons: { icon: "/driver-icon-192.png", apple: "/driver-apple-touch-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#0B1F3A",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** Mobile-first shell: phone-width column, centered on bigger screens. */
export default function DriverLayout({ children }: { children: React.ReactNode }) {
  return (
    <DriverAppProviders>
      <div className="mx-auto min-h-svh max-w-md bg-muted/40 shadow-sm">{children}</div>
    </DriverAppProviders>
  );
}
