
"use client"; // Add this if not present, for useState and useEffect

import type { PropsWithChildren } from 'react';
import React, { useState, useEffect } from 'react'; // Import useState and useEffect
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { Logo } from '@/components/icons/logo';
import { SplashScreen } from '@/components/layout/splash-screen'; // Import SplashScreen
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Button } from '@/components/ui/button';
import { LogOut, UserX } from 'lucide-react'; // Changed LogOut to UserX for variety, can revert
import Link from 'next/link';
import { TierProvider } from '@/context/tier-context';
import { auth } from '@/lib/firebase'; // Import Firebase auth for logout
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export default function AppLayout({ children }: PropsWithChildren) {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const handleSplashFinished = () => {
    setShowSplash(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      router.push('/login'); 
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({ title: "Logout Failed", description: error.message || "Could not log out.", variant: "destructive" });
    }
  };

  if (showSplash) {
    return <SplashScreen onFinished={handleSplashFinished} />;
  }

  return (
    <TierProvider>
      <SidebarProvider defaultOpen={false}>
        <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border">
          <SidebarHeader className="p-4">
            <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <Logo className="h-7 sm:h-8 w-auto" />
            </Link>
            <Link href="/" className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="hsl(var(--primary))" className="h-8 w-8">
                  <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
                </svg>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <MainNav />
          </SidebarContent>
          <SidebarSeparator />
          <SidebarFooter>
            <div className="group-data-[collapsible=icon]:hidden p-2">
               <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <UserX className="mr-2 h-4 w-4" /> Logout
              </Button>
            </div>
            <div className="hidden group-data-[collapsible=icon]:flex p-2 justify-center">
               <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
                <UserX className="h-5 w-5" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex-1 py-2 px-0 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
            {children}
          </main>
          <footer className="py-4 px-4 sm:px-6 md:px-8 border-t border-border/40 text-center text-xs text-muted-foreground">
            ©️ 2025 Designed By EDC Media
          </footer>
        </SidebarInset>
      </SidebarProvider>
    </TierProvider>
  );
}
