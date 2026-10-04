"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fuel, Home, Truck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { href: "/driver", label: "Home", icon: Home },
  { href: "/driver/missions", label: "Missions", icon: Truck },
  { href: "/driver/fuel", label: "Fuel", icon: Fuel },
  { href: "/driver/profile", label: "Profile", icon: User },
];

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md border-t bg-background pb-[env(safe-area-inset-bottom)]">
      <ul className="grid grid-cols-4">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = href === "/driver" ? pathname === href : pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-xs",
                  active ? "font-medium text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
