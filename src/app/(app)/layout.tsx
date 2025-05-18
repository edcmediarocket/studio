import type { PropsWithChildren } from 'react';
import { Header } from '@/components/layout/header';
import { MainNav } from '@/components/layout/main-nav';
import { Logo } from '@/components/icons/logo';
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
import { LogOut } from 'lucide-react';
import Link from 'next/link';

export default function AppLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="none" variant="sidebar" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4">
          <Link href="/" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <Logo className="h-8 w-auto" />
          </Link>
          {/* Icon version for collapsed state */}
          <Link href="/" className="hidden group-data-[collapsible=icon]:flex items-center justify-center">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <MainNav />
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter>
           {/* Placeholder for user info or quick actions in collapsed sidebar */}
          <div className="group-data-[collapsible=icon]:hidden p-2">
             <Button variant="ghost" className="w-full justify-start">
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
          <div className="hidden group-data-[collapsible=icon]:flex p-2 justify-center">
             <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-8 pt-6 overflow-y-auto">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
