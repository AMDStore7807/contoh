"use client";

import * as React from "react";
import {
  AlertTriangle,
  BookOpen,
  Home,
  Network,
  Settings2,
  UserCog,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import LogoutButton from "@/components/LogoutButton";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },

  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Devices",
      url: "/devices",
      icon: Network,
    },
    {
      title: "Faults",
      url: "/faults",
      icon: AlertTriangle,
    },
    {
      title: "Admin",
      url: "/admin",
      icon: UserCog,
      items: [
        {
          title: "Preset",
          url: "#",
        },
        {
          title: "Provisions",
          url: "#",
        },
        {
          title: "Virtual Parameters",
          url: "#",
        },
        {
          title: "Files",
          url: "#",
        },
        {
          title: "Config",
          url: "#",
        },
        {
          title: "Permissions",
          url: "#",
        },
        {
          title: "Users",
          url: "#",
        },
      ],
    },
    {
      title: "Tutorial",
      url: "#",
      icon: BookOpen,
      items: [
        {
          title: "Konek Modem",
          url: "#",
        },
        {
          title: "Konek Mikrotik",
          url: "#",
        },
        {
          title: "Konek Beatcom",
          url: "#",
        },
      ],
    },
    {
      title: "Pengaturan",
      url: "/settings",
      icon: Settings2,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [config, setConfig] = React.useState({ companyName: "" });
  const { hasAccess, token } = useAuth();

  // Load config from API on component mount
  React.useEffect(() => {
    if (!token) return;
    const loadConfig = async () => {
      try {
        const response = await fetch("/api/config", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const configData = await response.json();
          setConfig(configData);
        }
      } catch (error) {
        console.error("Error loading config:", error);
      }
    };
    loadConfig();
  }, [token]);

  // Create resource mapping for menu items
  const resourceMapping: { [key: string]: string } = {
    Devices: "devices",
    Faults: "faults",
    Preset: "presets",
    Provisions: "provisions",
    "Virtual Parameters": "virtualParameters",
    Files: "files",
    Config: "config",
    Permissions: "permissions",
    Users: "users",
  };

  // Filter nav items based on permissions from database
  const filteredNavMain = data.navMain
    .map((item) => {
      // Check main menu items
      const resourceName = resourceMapping[item.title];
      if (resourceName) {
        const hasPermission = hasAccess(resourceName, 1);
        if (!hasPermission) {
          return null; // Hide the entire menu item
        }
        return {
          ...item,
          url: hasPermission ? item.url : "#",
        };
      }

      // Check sub-menu items
      if (item.items) {
        const filteredItems = item.items.filter((subItem) => {
          const subResourceName = resourceMapping[subItem.title];
          if (subResourceName) {
            return hasAccess(subResourceName, 1);
          }
          return true; // Show items without specific resource mapping
        });

        // Only show the menu group if it has items or if it's not admin-related
        if (filteredItems.length === 0 && item.title === "Admin") {
          return null;
        }

        return {
          ...item,
          items: filteredItems,
        };
      }

      return item;
    })
    .filter((item) => item !== null); // Remove null items

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex flex-col items-center gap-2 px-4 py-2">
          <img src="/logo.png" alt="GenieACS Logo" className="w-full h-auto" />
          <span className="text-sm font-medium">GenieACS by Beatcom</span>
          <span
            className={cn(
              "text-xl font-semibold",
              config.companyName ? "" : "h-7"
            )}
          >
            {config.companyName}
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNavMain} />
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
