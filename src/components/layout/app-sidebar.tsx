
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Gauge, Scale, Settings, Dumbbell, Home } from "lucide-react"; // LogOut removed
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
import { Separator } from "@/components/ui/separator";
// import { useAuth } from "@/hooks/use-auth"; // Removed
// import { Button } from "../ui/button"; // Removed

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/fasting", icon: CalendarDays, label: "Fasting" },
  { href: "/weight", icon: Scale, label: "Weight" },
  { href: "/fat", icon: Gauge, label: "Body Fat" },
  { href: "/workout", icon: Dumbbell, label: "Workout" },
];

export function AppSidebar() {
  const pathname = usePathname();
  // const { logout, currentUser } = useAuth(); // Removed

  // const handleLogout = async () => { // Removed
  //   await logout();
  // };

  // if (!currentUser) { // Removed
  //   return null; 
  // }

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
                  isActive={pathname === item.href}
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
            {/* <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                    <Settings />
                    <span>Settings</span>
                </SidebarMenuButton>
            </SidebarMenuItem> */}
            {/* Logout button removed */}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
