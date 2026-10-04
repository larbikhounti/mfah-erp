import { DriverAuthGate } from "@/components/driver-portal/driver-auth-gate";

export default function DriverPortalLayout({ children }: { children: React.ReactNode }) {
  return <DriverAuthGate>{children}</DriverAuthGate>;
}
