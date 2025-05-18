
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BarChart2, Eye, UserCircle, BotMessageSquare, Signal, Calculator, GitCompareArrows, Activity, SlidersHorizontal, Newspaper, Rocket, Siren, Lightbulb, DatabaseZap, ShieldQuestion } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useTier } from "@/context/tier-context"; 

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isProFeature?: boolean; 
  isPremiumFeature?: boolean; 
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/signals", label: "AI Signals", icon: Signal },
  { href: "/custom-signals", label: "Custom Signals", icon: SlidersHorizontal, isProFeature: true },
  { href: "/analysis", label: "AI Analysis", icon: BarChart2 },
  { href: "/news-buzz", label: "News & Buzz", icon: Newspaper },
  { href: "/narrative-engine", label: "Narrative Engine", icon: Lightbulb, isPremiumFeature: true }, 
  { href: "/onchain-intelligence", label: "On-Chain Intel", icon: DatabaseZap, isPremiumFeature: true }, 
  { href: "/market-anomalies", label: "Market Anomalies", icon: Siren, isPremiumFeature: true },
  { href: "/confidence-dashboard", label: "Confidence Dashboard", icon: ShieldQuestion, isPremiumFeature: true },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/roi-calculator", label: "ROI Calculator", icon: Calculator },
  { href: "/ai-advisor", label: "AI Advisor", icon: BotMessageSquare, isProFeature: true },
  { href: "/coin-comparison", label: "Coin Comparison", icon: GitCompareArrows },
  { href: "/on-chain-insights", label: "On-Chain Insights", icon: Activity }, 
  { href: "/account", label: "Account", icon: UserCircle },
];

export function MainNav() {
  const pathname = usePathname();
  const { currentTier } = useTier(); 

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        let styleAsLocked = false;
        let featureLockedForAria = false; // For aria-disabled
        let tooltipText = item.label;
        
        if (item.isPremiumFeature) {
            if (currentTier !== "Premium" && currentTier !== "Pro") { 
                styleAsLocked = true;
                featureLockedForAria = true;
                tooltipText = `${item.label} (Premium Feature - Upgrade to Access)`;
            } else {
                 tooltipText = `${item.label} (Premium Feature)`;
            }
        } else if (item.isProFeature) {
            if (currentTier !== "Pro" && currentTier !== "Premium") { 
                styleAsLocked = true;
                featureLockedForAria = true;
                tooltipText = `${item.label} (Pro/Premium Feature - Upgrade to Access)`;
            } else {
                tooltipText = `${item.label} (Pro/Premium Feature)`;
            }
        }
        
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))}
              tooltip={{
                children: tooltipText, 
                className: "bg-popover text-popover-foreground"
              }}
              className={cn(
                styleAsLocked 
                  ? "opacity-50 blur-sm pointer-events-none" 
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <Link href={item.href} aria-disabled={featureLockedForAria} tabIndex={featureLockedForAria ? -1 : undefined}>
                <item.icon />
                <span className="flex items-center">
                  {item.label}
                  {(item.isProFeature || item.isPremiumFeature) && <Rocket className="ml-auto h-3.5 w-3.5 text-neon opacity-80 group-data-[collapsible=icon]:hidden" />}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
