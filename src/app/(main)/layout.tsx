
"use client"; 

import React from 'react';
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"; // Import SidebarTrigger
import { Button } from '@/components/ui/button'; // Button might be used by SidebarTrigger or for custom styling
import { PanelLeft } from 'lucide-react'; // Default icon for SidebarTrigger

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar /> {/* This will render as a Sheet on mobile */}
      <SidebarInset>
        {/* Mobile-only header with a trigger */}
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
          <h1 className="text-lg font-semibold">Fasting Tracker</h1>
          {/* Use the existing SidebarTrigger. It's already styled as a button with an icon. */}
          <SidebarTrigger />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </div>
  );
}

