"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { IconChevronRight, type Icon } from "@tabler/icons-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

function isPathActive(pathname: string, url: string, exact = true): boolean {
  return exact ? pathname === url : pathname.startsWith(url)
}

export interface NavLeafItem {
  title: string
  url: string
  icon?: Icon
}

export interface NavItem extends NavLeafItem {
  items?: NavLeafItem[]
}

function NavLink({ item }: { item: NavLeafItem }) {
  const pathname = usePathname()
  const isActive = isPathActive(pathname, item.url)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={item.title}
        asChild
        className={
          isActive
            ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground duration-200 ease-linear"
            : ""
        }
      >
        <Link href={item.url}>
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

function NavGroup({ item }: { item: NavItem }) {
  const pathname = usePathname()
  const subItems = item.items ?? []
  const isChildActive = subItems.some((sub) => isPathActive(pathname, sub.url, false))

  return (
    <Collapsible defaultOpen={isChildActive} className="group/collapsible">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {subItems.map((sub) => {
              const isActive = isPathActive(pathname, sub.url)

              return (
                <SidebarMenuSubItem key={sub.title}>
                  <SidebarMenuSubButton asChild isActive={isActive}>
                    <Link href={sub.url}>
                      {sub.icon && <sub.icon />}
                      <span>{sub.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

export function NavMain({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) =>
            item.items && item.items.length > 0 ? (
              <NavGroup key={item.title} item={item} />
            ) : (
              <NavLink key={item.title} item={item} />
            )
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
