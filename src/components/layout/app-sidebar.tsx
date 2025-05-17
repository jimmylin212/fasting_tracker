
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Gauge, Scale, Settings, LogOut, Dumbbell, Home } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/fasting", icon: CalendarDays, label: "Fasting" },
  { href: "/weight", icon: Scale, label: "Weight" },
  { href: "/fat", icon: Gauge, label: "Body Fat" },
  { href: "/workout", icon: Dumbbell, label: "Workout" },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-auto text-sidebar-primary shrink-0 group-data-[collapsible=icon]:hidden" />
           <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden text-sidebar-primary">Fasting Tracker</span>
          <SidebarTrigger className="ml-auto group-data-[collapsible=icon]:hidden" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href} // Exact match for home, startsWith for others might be needed if nested routes
                  tooltip={item.label}
                >
                  <a>
                    <item.icon />
                    <span>{item.label}</span>
                  </a>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2 mt-auto">
        <Separator className="my-2" />
         <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Logout" variant="outline">
                    <LogOut />
                    <span>Logout</span>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
