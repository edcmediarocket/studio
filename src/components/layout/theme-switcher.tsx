
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

type Theme = "red" | "blue" | "purple" | "orange" | "green";

const themes: { value: Theme; label: string; className: string }[] = [
  { value: "red", label: "Galactic Red", className: "" }, // Default, no class needed for html tag
  { value: "blue", label: "Neon Blue", className: "theme-blue" },
  { value: "purple", label: "Cosmic Purple", className: "theme-purple" },
  { value: "orange", label: "Neon Orange", className: "theme-orange" },
  { value: "green", label: "Neon Green", className: "theme-green" },
];

const LOCAL_STORAGE_THEME_KEY = "rocket-meme-theme";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("red");

  React.useEffect(() => {
    const storedTheme = localStorage.getItem(LOCAL_STORAGE_THEME_KEY) as Theme | null;
    if (storedTheme && themes.some(t => t.value === storedTheme)) {
      setCurrentTheme(storedTheme);
    }
  }, []);

  React.useEffect(() => {
    // Remove all potential theme classes first
    document.documentElement.classList.remove(
      "theme-blue", 
      "theme-purple", 
      "theme-orange", 
      "theme-green"
    );

    const selectedThemeObject = themes.find(t => t.value === currentTheme);
    if (selectedThemeObject && selectedThemeObject.className) {
      document.documentElement.classList.add(selectedThemeObject.className);
    }
    // If it's the default "red" theme, no class is added, and the :root default applies.
    
    localStorage.setItem(LOCAL_STORAGE_THEME_KEY, currentTheme);
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
