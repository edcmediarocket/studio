
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BarChart2, Eye, UserCircle, BotMessageSquare, Signal, Calculator, GitCompareArrows, Activity, SlidersHorizontal, Newspaper, Rocket, Siren, Lightbulb, DatabaseZap, ShieldQuestion, ShieldAlert, Wand2 } from "lucide-react";
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
  { href: "/custom-signals", label: "Custom Signals", icon: SlidersHorizontal, isProFeature: true },
  { href: "/ai-advisor", label: "AI Advisor", icon: BotMessageSquare, isProFeature: true }, // Added AI Advisor
  { href: "/analysis", label: "AI Analysis", icon: BarChart2 },
  { href: "/news-buzz", label: "News & Buzz", icon: Newspaper },
  { href: "/narrative-engine", label: "Narrative Engine", icon: Lightbulb, isPremiumFeature: true },
  { href: "/onchain-intelligence", label: "On-Chain Intel", icon: DatabaseZap, isPremiumFeature: true },
  { href: "/market-anomalies", label: "Market Anomalies", icon: Siren, isPremiumFeature: true },
  { href: "/confidence-dashboard", label: "Confidence Dashboard", icon: ShieldQuestion, isPremiumFeature: true },
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

        if (item.href === "/admin/dashboard") {
          // No special locking for admin based on tier, only visibility
        } else if (item.isPremiumFeature) {
          tooltipText = `${item.label} (Premium Feature)`;
          if (currentTier !== "Premium" && currentTier !== "Pro") { // Pro has access to Premium
            tooltipText = `${item.label} (Premium Feature - Upgrade to Access)`;
            featureLocked = true; // This determines if the page content is locked
            styleAsLocked = true; // This determines if the nav link itself is styled as locked
          }
        } else if (item.isProFeature) {
          tooltipText = `${item.label} (Pro/Premium Feature)`;
          if (currentTier !== "Pro" && currentTier !== "Premium") {
            tooltipText = `${item.label} (Pro/Premium Feature - Upgrade to Access)`;
            featureLocked = true;
            styleAsLocked = true;
          }
        }
        
        // Override styleAsLocked to false, making nav links always appear active
        styleAsLocked = false;

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
                // styleAsLocked && "blur-sm opacity-50 pointer-events-none" // Removed conditional blur
              )}
              aria-disabled={false} // Always false now to ensure links are not visually treated as disabled by assistive tech
            >
              <Link href={item.href} onClick={handleLinkClick}>
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
