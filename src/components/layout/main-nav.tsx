
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, BarChart2, Eye, Settings2, UserCircle, BotMessageSquare, Signal } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from "@/components/ui/sidebar";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  subItems?: NavItem[];
}

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/signals", label: "AI Signals", icon: Signal },
  { href: "/analysis", label: "AI Analysis", icon: BarChart2 },
  { href: "/watchlist", label: "Watchlist", icon: Eye },
  { 
    href: "/tools", 
    label: "Tools", 
    icon: Settings2,
    subItems: [
      { href: "/tools#roi-calculator", label: "ROI Calculator", icon: BotMessageSquare }, // Consider using Calculator icon
      { href: "/tools#ai-chat", label: "AI Chat", icon: BotMessageSquare },
      { href: "/tools#coin-comparison", label: "Coin Comparison", icon: BotMessageSquare }, // Consider using GitCompareArrows icon
    ]
  },
  { href: "/account", label: "Account", icon: UserCircle },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href) && item.href !== "/tools")}
            tooltip={{children: item.label, className: "bg-popover text-popover-foreground"}}
          >
            <Link href={item.href}>
              <item.icon />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
          {item.subItems && (pathname.startsWith(item.href)) && ( // Show sub-items if path starts with parent href
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <SidebarMenuSubItem key={subItem.href}>
                  <SidebarMenuSubButton
                    asChild
                    // isActive={pathname === subItem.href} // For hash links, direct comparison is tricky
                    isActive={pathname + (typeof window !== 'undefined' ? window.location.hash : '') === subItem.href}
                  >
                    <Link href={subItem.href}>
                      <subItem.icon />
                      <span>{subItem.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
