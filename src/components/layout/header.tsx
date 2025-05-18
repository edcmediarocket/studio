
import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Rocket } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-7 sm:h-8 w-auto" />
          </Link>
        </div>
        
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="hidden sm:flex border-neon text-neon hover:bg-neon hover:text-primary-foreground">
            <Link href="/account#subscription">
              <Rocket className="mr-2 h-4 w-4" />
              Go Pro
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
