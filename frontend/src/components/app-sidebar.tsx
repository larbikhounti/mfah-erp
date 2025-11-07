"use client";

import type * as React from "react";
import {
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconSearch,
  IconSettings,
  IconUsers,
  IconShield,
  IconWorld,
  IconDeviceGamepad2,
  IconCpu,
  IconDeviceDesktop,
  IconPlayerPlay,
  IconArmchair,
  IconTicket,
  IconMessage,
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
      title: "Comments",
      url: "/dashboard/comments",
      icon: IconMessage,
    },
    {
      title: "Stores",
      url: "/dashboard/doms",
      icon: IconWorld,
    },
    {
      title: "Game Types",
      url: "/dashboard/game-types",
      icon: IconDeviceGamepad2,
    }, // Added game types navigation item
    {
      title: "Machine Types",
      url: "/dashboard/machine-types",
      icon: IconCpu,
    },
    {
      title: "Machines",
      url: "/dashboard/machines",
      icon: IconDeviceDesktop,
    },
    // {
    //   title: "Machine Chairs",
    //   url: "/dashboard/machine-chairs",
    //   icon: IconArmchair,
    // },
    {
      title: "Games",
      url: "/dashboard/games",
      icon: IconPlayerPlay,
    },
      {
      title: "Coupons",
      url: "/dashboard/coupons",
      icon: IconTicket,
    },
    {
      title: "Experiences",
      url: "/dashboard/experiences",
      icon: IconListDetails,
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
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Store Manager</span>
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
