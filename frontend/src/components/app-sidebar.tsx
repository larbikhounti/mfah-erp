"use client";

import type * as React from "react";
import {
  IconDashboard,
  IconUsers,
  IconShield,
  IconTruck,
  IconSteeringWheel,
  IconBuilding,
  IconBriefcase,
  IconRoute,
  IconFileInvoice,
  IconReceipt,
  IconLockAccess,
  IconReportAnalytics,
  IconSettings,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();

  const navMainData = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Missions",
      url: "/dashboard/missions",
      icon: IconRoute,
    },
    {
      title: "Trucks",
      url: "/dashboard/trucks",
      icon: IconTruck,
    },
    {
      title: "Drivers",
      url: "/dashboard/drivers",
      icon: IconSteeringWheel,
    },
    {
      title: "Clients",
      url: "/dashboard/clients",
      icon: IconBuilding,
    },
    {
      title: "Subcontractors",
      url: "/dashboard/subcontractors",
      icon: IconBriefcase,
    },
    {
      title: "Client Invoices",
      url: "/dashboard/client-invoices",
      icon: IconFileInvoice,
    },
    {
      title: "Subcontractor Bills",
      url: "/dashboard/subcontractor-bills",
      icon: IconReceipt,
    },
    {
      title: "Reports",
      url: "/dashboard/reports",
      icon: IconReportAnalytics,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
    },
    {
      title: "Roles",
      url: "/dashboard/roles",
      icon: IconShield,
    },
    {
      title: "Permissions",
      url: "/dashboard/permissions",
      icon: IconLockAccess,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#" className="flex items-center">
                <span className="rounded-md bg-slate-900 px-2.5 py-1.5">
                  <img src="/mfah-logo.png" alt="MFAH Globalog" className="h-4 w-auto" />
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={
            user
              ? {
                  name: user.name,
                  email: user.email,
                  avatar: "/avatars/default.jpg",
                }
              : {
                  name: "User",
                  email: "user@example.com",
                  avatar: "/avatars/default.jpg",
                }
          }
        />
      </SidebarFooter>
    </Sidebar>
  );
}
