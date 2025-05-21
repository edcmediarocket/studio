
"use client"; 

import type { PropsWithChildren } from 'react';
import React, { useState, useEffect } from 'react'; 
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { Logo } from '@/components/icons/logo';
import { SplashScreen } from '@/components/layout/splash-screen'; 
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
import { UserX } from 'lucide-react'; 
import Link from 'next/link';
import { TierProvider } from '@/context/tier-context';
import { auth } from '@/lib/firebase'; 
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
                  <path d="M20.55,25.22c0-5.52,4.48-10,10-10s10,4.48,10,10c0,4.42-2.87,8.15-6.84,9.44l6.84,12.33h-7.66l-6.84-12.33V25.22z M20.55,15.22v27.5h-7.66V15.22H20.55z M0,42.72h7.66V15.22H0V42.72z" />
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
          <main className="flex-1 min-h-0 py-2 px-0 sm:p-4 md:p-6 overflow-y-auto">
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
