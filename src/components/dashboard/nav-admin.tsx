"use client";

import { IconDots, IconChevronDown, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { useState } from "react";

interface AdminItem {
  name: string;
  url: string;
  icon: Icon;
  submenu?: {
    name: string;
    url: string;
    icon?: Icon;
  }[];
}

export function NavAdmin({ items }: { items: AdminItem[] }) {
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const toggleSubmenu = (name: string) => {
    // Close other submenus when opening a new one
    setOpenSubmenus((prev) => {
      const newState = { ...prev };

      // If this menu is being opened, close all others
      if (!prev[name]) {
        Object.keys(newState).forEach((key) => {
          if (key !== name) newState[key] = false;
        });
      }

      // Toggle the current menu
      newState[name] = !prev[name];
      return newState;
    });
  };

  // Create an array with menu items and their submenu items grouped together
  const renderMenuItems = () => {
    const result: React.ReactNode[] = [];

    items.forEach((item) => {
      // Add the main menu item
      result.push(
        <SidebarMenuItem key={item.name}>
          {item.submenu ? (
            <SidebarMenuButton
              onClick={() => toggleSubmenu(item.name)}
              className="flex justify-between items-center w-full"
            >
              <div className="flex items-center justify-center gap-2">
                <item.icon className="text-sidebar-foreground/70" size={16} />
                <span className="text-sm">{item.name}</span>
              </div>
              <IconChevronDown
                className={`h-4 w-4 transition-transform ${openSubmenus[item.name] ? "rotate-180" : ""}`}
              />
            </SidebarMenuButton>
          ) : (
            <>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  <item.icon className="text-sidebar-foreground/70" size={16} />
                  <span className="text-sm">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </>
          )}
        </SidebarMenuItem>
      );

      // Add submenu items immediately after their parent
      if (item.submenu && openSubmenus[item.name]) {
        // Add a visual indicator for submenu group
        result.push(
          <div
            key={`${item.name}-submenu-group`}
            className="pl-5 border-l border-gray-200 dark:border-gray-700 ml-4 my-1"
          >
            {item.submenu.map((subItem) => (
              <SidebarMenuItem key={`${item.name}-${subItem.name}`}>
                <SidebarMenuButton asChild className="pl-3">
                  <Link href={subItem.url}>
                    {subItem.icon && <subItem.icon className="h-4 w-4" />}
                    <span>{subItem.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </div>
        );
      }
    });

    // Add the "More" item at the end
    result.push(
      <SidebarMenuItem key="more-menu-item">
        <SidebarMenuButton className="text-sidebar-foreground/70">
          <IconDots className="text-sidebar-foreground/70" />
          <span>More</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );

    return result;
  };

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Admin</SidebarGroupLabel>
      <SidebarMenu>{renderMenuItems()}</SidebarMenu>
    </SidebarGroup>
  );
}
