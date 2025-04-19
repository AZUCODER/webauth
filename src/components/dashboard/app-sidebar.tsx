"use client";

import * as React from "react";
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconSearch,
  IconUsers,
  IconPencilPlus,
  IconCircles,
  IconSettings,
  IconHistory,
  IconAdjustments,
} from "@tabler/icons-react";

import { NavApps } from "@/components/dashboard/nav-apps";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavAdmin } from "@/components/dashboard/nav-admin";
import { NavSecondary } from "@/components/dashboard/nav-secondary";
import { NavUser } from "@/components/dashboard/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  // Sidebar-Nav-dashboards
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Projects",
      url: "#",
      icon: IconFolder,
    },
    {
      title: "Team",
      url: "#",
      icon: IconUsers,
    },
  ],

  // Sidebar-Nav-apps
  apps: [
    {
      name: "CMS",
      url: "#",
      icon: IconPencilPlus,
      submenu: [
        {
          name: "Posts",
          url: "/posts/view",
        },
        {
          name: "Categories",
          url: "/post-categories/view",
        },
      ],
    },
    {
      name: "CRM",
      url: "#",
      icon: IconUsers,
      submenu: [
        {
          name: "Customers",
          url: "/customers/view",
        },
        {
          name: "Orders",
          url: "/orders/view",
        },
      ],
    },
  ],

  // Sidebar-Nav-admin
  admin: [
    {
      name: "Authorization",
      url: "#",
      icon: IconCircles,
      submenu: [
        {
          name: "Permissions",
          url: "/permissions",
        },
        {
          name: "Roles",
          url: "/permissions/roles",
        },
      ],
    },
    {
      name: "Security",
      url: "#",
      icon: IconHistory,
      submenu: [
        {
          name: "Audit Logs",
          url: "/audit-logs",
        },
      ],
    },
    {
      name: "Settings",
      url: "#",
      icon: IconSettings,
      submenu: [
        {
          name: "Users",
          url: "/users",
        },
        {
          name: "Site Settings",
          url: "/settings",
        },
      ],
    },
  ],

  // Sidebar-Nav-secondary
  navSecondary: [
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
  ],
};
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="#">
                <span className="text-base font-semibold">Admin Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavApps items={data.apps} />
        <NavAdmin items={data.admin} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
