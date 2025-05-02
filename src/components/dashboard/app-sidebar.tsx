"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import api from '@/lib/api/axios';
import {
  IconChartBar,
  IconDashboard,
  IconFolder,
  IconHelp,
  IconUsers,
  IconPencilPlus,
  IconCircles,
  IconSettings,
  IconList,
  IconMessageChatbot,
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
      name: "Permissions",
      url: "#",
      icon: IconCircles,
      submenu: [
        {
          name: "Permissions List",
          url: "/permissions",
        },
        {
          name: "Role Management",
          url: "/permissions/roles",
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
      title: "Chat with AI",
      url: "#",
      icon: IconMessageChatbot,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Fetch the user session to determine their role
    const fetchUserSession = async () => {
      try {
        const response = await api.get('/api/auth/session');
        setUserRole(response.data.role);
      } catch (error) {
        console.error('Error fetching user session:', error);
      }
    };

    fetchUserSession();
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <IconList />
                <span className="text-base font-semibold">Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavApps items={data.apps} />
        {/* Only show admin navigation to users with ADMIN role */}
        {userRole === 'ADMIN' && <NavAdmin items={data.admin} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
