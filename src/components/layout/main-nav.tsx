
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BarChart2, Eye, UserCircle, BotMessageSquare, Signal, Calculator, GitCompareArrows, Activity, SlidersHorizontal, Newspaper, Rocket, Siren, Lightbulb, DatabaseZap, ShieldQuestion, ShieldAlert } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useTier } from "@/context/tier-context"; 
import { useAdminAuth } from "@/hooks/use-admin-auth"; // Import the new hook

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  isProFeature?: boolean; 
  isPremiumFeature?: boolean; 
}

const baseNavItems: NavItem[] = [
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
  const { isAdmin, loading: adminAuthLoading } = useAdminAuth();

  const getNavItems = () => {
    const items = [...baseNavItems];
    if (!adminAuthLoading && isAdmin) {
      items.push({
        href: "/admin/dashboard",
        label: "Admin",
        icon: ShieldAlert,
      });
    }
    return items;
  };

  const navItemsToDisplay = getNavItems();

  return (
    <SidebarMenu>
      {navItemsToDisplay.map((item) => {
        let styleAsLocked = false;
        let featureLockedForAria = false;
        let tooltipText = item.label;
        
        if (item.href === "/admin/dashboard") {
          // Admin link is never locked visually if the user is admin (it won't even be in the list if not admin)
        } else if (item.isPremiumFeature) {
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
              aria-disabled={featureLockedForAria}
              tabIndex={featureLockedForAria ? -1 : undefined}
            >
              <Link href={item.href}>
                <item.icon />
                <span className="flex items-center">
                  {item.label}
                  {(item.isProFeature || item.isPremiumFeature) && item.href !== "/admin/dashboard" && <Rocket className="ml-auto h-3.5 w-3.5 text-neon opacity-80 group-data-[collapsible=icon]:hidden" />}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
