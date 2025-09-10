"use client"

import type * as React from "react"
import {
  IconChartBar,
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
  IconPlayerPlay
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()

  const navMainData = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Test",
      url: "/dashboard/test",
      icon: IconListDetails,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Files",
      url: "#",
      icon: IconFolder,
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
    }, // Added roles navigation item
    {
      title: "Doms", // Added domains navigation item
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
    {
      title: "Games",
      url: "/dashboard/games",
      icon: IconPlayerPlay,
    },
    {
      title: "Experiences",
      url: "/dashboard/experiences",
      icon: IconListDetails,
    },
  ]

const navSecondaryData = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
  {
    title: "Get Help",
    url: "#",
    icon: IconHelp,
  },
  {
    title: "Search",
    url: "#",
    icon: IconSearch,
  },
]

const navDocumentsData = [
  {
    name: "Introduction",
    url: "#",
    icon: IconFileDescription,
  },
  {
    name: "Get Started",
    url: "#",
    icon: IconFileWord,
  },
  {
    name: "Tutorials",
    url: "#",
    icon: IconFileAi,
  },
  {
    name: "Changelog",
    url: "#",
    icon: IconDatabase,
  },
]

return (
  <Sidebar collapsible="offcanvas" {...props}>
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
            <a href="#">
              <IconInnerShadowTop className="!size-5" />
              <span className="text-base font-semibold">Dom Manager</span>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain items={navMainData} />
      <NavDocuments items={navDocumentsData} />
      <NavSecondary items={navSecondaryData} className="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser user={user ? {
        name: user.name,
        email: user.email,
        avatar: "/avatars/default.jpg"
      } : {
        name: "User",
        email: "user@example.com",
        avatar: "/avatars/default.jpg"
      }} />
    </SidebarFooter>
  </Sidebar>
)
}
