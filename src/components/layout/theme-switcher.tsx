
"use client";

import * as React from "react";
import { Paintbrush, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ThemeValue = "logo-cyan" | "logo-magenta" | "logo-pink" | "neon-orange" | "neon-green" | "neon-blue" | "neon-lime" | "neon-yellow" | "neon-royal-blue";

interface ThemeOption {
  value: ThemeValue;
  label: string;
  className: string;
}

const themes: ThemeOption[] = [
  { value: "logo-cyan", label: "Logo Cyan (Default)", className: "theme-logo-cyan" }, 
  { value: "neon-blue", label: "Neon Blue", className: "theme-neon-blue" },
  { value: "neon-royal-blue", label: "Neon Royal Blue", className: "theme-neon-royal-blue" },
  { value: "logo-magenta", label: "Logo Magenta", className: "theme-logo-magenta" },
  { value: "logo-pink", label: "Logo Pink", className: "theme-logo-pink" },
  { value: "neon-orange", label: "Neon Orange", className: "theme-orange" },
  { value: "neon-green", label: "Neon Green", className: "theme-green" },
  { value: "neon-lime", label: "Neon Lime", className: "theme-neon-lime" },
  { value: "neon-yellow", label: "Neon Yellow", className: "theme-neon-yellow" },
];

const LOCAL_STORAGE_THEME_KEY = "rocketMemeUserTheme_v3";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = React.useState<ThemeValue>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemeValue | null;
      if (storedTheme && themes.some(t => t.value === storedTheme)) {
        return storedTheme;
      }
    }
    return "logo-cyan"; // Default theme matching new logo colors
  });

  React.useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as ThemeValue | null;
    if (storedTheme && themes.some(t => t.value === storedTheme) && storedTheme !== currentTheme) {
      setCurrentTheme(storedTheme);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  React.useEffect(() => {
    themes.forEach(themeOption => {
      if (themeOption.className) { 
        document.documentElement.classList.remove(themeOption.className);
      }
    });

    const selectedThemeObject = themes.find(t => t.value === currentTheme);
    if (selectedThemeObject && selectedThemeObject.className) {
      document.documentElement.classList.add(selectedThemeObject.className);
    }
    
    if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_THEME_KEY, currentTheme);
    }
  }, [currentTheme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title="Change Theme">
          <Paintbrush className="h-5 w-5" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((theme) => (
          <DropdownMenuItem
            key={theme.value}
            onClick={() => setCurrentTheme(theme.value)}
          >
            <span className="flex items-center justify-between w-full">
              {theme.label}
              {currentTheme === theme.value && <Check className="ml-2 h-4 w-4" />}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
