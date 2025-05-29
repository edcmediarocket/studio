
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BarChart2, Eye, UserCircle, BotMessageSquare, Signal, Calculator, GitCompareArrows, Activity, SlidersHorizontal, Newspaper, Rocket, Siren, Lightbulb, DatabaseZap, ShieldQuestion, ShieldAlert, Flame, SearchCode, BellPlus, GraduationCap, Target } from "lucide-react"; // Added Target
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useTier } from "@/context/tier-context";
import { useAdminAuth } from "@/hooks/use-admin-auth";

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
  { href: "/alpha-feed", label: "Alpha Feed", icon: Flame, isPremiumFeature: true },
  { href: "/strategic-insights", label: "Strategic Insights", icon: Target, isPremiumFeature: true },
  { href: "/custom-signals", label: "Custom Signals", icon: SlidersHorizontal, isProFeature: true },
  { href: "/ai-advisor", label: "AI Advisor", icon: BotMessageSquare, isProFeature: true }, 
  { href: "/ai-coach", label: "AI Coach", icon: GraduationCap, isPremiumFeature: true },
  { href: "/analysis", label: "AI Analysis", icon: BarChart2 },
  { href: "/news-buzz", label: "News & Buzz", icon: Newspaper },
  { href: "/narrative-engine", label: "Narrative Engine", icon: Lightbulb, isPremiumFeature: true },
  { href: "/onchain-intelligence", label: "On-Chain Intel", icon: DatabaseZap, isPremiumFeature: true },
  { href: "/market-anomalies", label: "Market Anomalies", icon: Siren, isPremiumFeature: true },
  { href: "/confidence-dashboard", label: "Confidence Dashboard", icon: ShieldQuestion, isPremiumFeature: true },
  { href: "/pre-launch-radar", label: "Pre-Launch Radar", icon: SearchCode, isPremiumFeature: true }, 
  { href: "/smart-alerts", label: "Smart Alerts", icon: BellPlus, isPremiumFeature: true },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { href: "/roi-calculator", label: "ROI Calculator", icon: Calculator },
  { href: "/coin-comparison", label: "Coin Comparison", icon: GitCompareArrows },
  { href: "/on-chain-insights", label: "On-Chain Insights", icon: Activity },
  { href: "/account", label: "Account", icon: UserCircle },
];

export function MainNav() {
  const pathname = usePathname();
  const { currentTier } = useTier();
  const { isAdmin, loading: adminAuthLoading } = useAdminAuth();
  const { isMobile, setOpenMobile } = useSidebar(); 

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

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <SidebarMenu>
      {navItemsToDisplay.map((item) => {
        let tooltipText = item.label;
        let featureLocked = false;
        let styleAsLocked = false;

        if (item.isPremiumFeature) {
          featureLocked = currentTier !== 'Premium';
          if (featureLocked) tooltipText = `${item.label} (Upgrade to Premium)`;
        } else if (item.isProFeature) {
          featureLocked = currentTier !== 'Pro' && currentTier !== 'Premium';
          if (featureLocked) tooltipText = `${item.label} (Upgrade to Pro/Premium)`;
        }
        
        // Admin link should not be styled as locked by tier logic
        if (item.href === "/admin/dashboard") {
          featureLocked = false; 
          styleAsLocked = false;
        } else {
          styleAsLocked = featureLocked;
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
                "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                // Removed blur/opacity classes: styleAsLocked && "blur-sm opacity-50 pointer-events-none"
              )}
              aria-disabled={false} // All links are considered enabled for navigation
            >
              <Link href={item.href} onClick={handleLinkClick}>
                <item.icon />
                <span className="flex items-center">
                  {item.label}
                  {(item.isProFeature || item.isPremiumFeature) && item.href !== "/admin/dashboard" && (
                     <Rocket className="ml-auto h-3.5 w-3.5 text-neon opacity-80 group-data-[collapsible=icon]:hidden" />
                  )}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}

    