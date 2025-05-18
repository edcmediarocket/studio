
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BarChart2, Eye, UserCircle, BotMessageSquare, Signal, Calculator, GitCompareArrows, Activity, SlidersHorizontal, Newspaper, Rocket } from "lucide-react"; // Added Rocket
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useTier } from "@/context/tier-context"; // Added useTier

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isProFeature?: boolean; // New property
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/signals", label: "AI Signals", icon: Signal },
  { href: "/custom-signals", label: "Custom Signals", icon: SlidersHorizontal, isProFeature: true },
  { href: "/analysis", label: "AI Analysis", icon: BarChart2 },
  { href: "/news-buzz", label: "News & Buzz", icon: Newspaper },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/roi-calculator", label: "ROI Calculator", icon: Calculator },
  { href: "/ai-advisor", label: "AI Advisor", icon: BotMessageSquare, isProFeature: true },
  { href: "/coin-comparison", label: "Coin Comparison", icon: GitCompareArrows },
  { href: "/on-chain-insights", label: "On-Chain Insights", icon: Activity },
  { href: "/account", label: "Account", icon: UserCircle },
];

export function MainNav() {
  const pathname = usePathname();
  const { currentTier } = useTier(); // Get current tier

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const isLocked = item.isProFeature && currentTier !== "Pro";
        
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
              tooltip={{
                children: isLocked ? `${item.label} (Pro Feature)` : item.label, 
                className: "bg-popover text-popover-foreground"
              }}
              className={cn(isLocked && "opacity-70 hover:bg-sidebar-accent/50 cursor-default")} // Basic styling for locked items
            >
              <Link href={item.href} onClick={(e) => { if (isLocked) e.preventDefault(); /* Optional: show toast or modal */ }}>
                <item.icon />
                <span className="flex items-center">
                  {item.label}
                  {item.isProFeature && <Rocket className="ml-auto h-3.5 w-3.5 text-neon opacity-80 group-data-[collapsible=icon]:hidden" />}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
