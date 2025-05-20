
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

// "blue" now corresponds to "Logo Cyan" and is the default.
// "red" now corresponds to "Logo Pink".
// "purple" now corresponds to "Logo Magenta".
type Theme = "blue" | "purple" | "red" | "orange" | "green";

const themes: { value: Theme; label: string; className: string }[] = [
  { value: "blue", label: "Logo Cyan (Default)", className: "theme-blue" }, 
  { value: "purple", label: "Logo Magenta", className: "theme-purple" },
  { value: "red", label: "Logo Pink", className: "theme-red" },
  { value: "orange", label: "Neon Orange", className: "theme-orange" },
  { value: "green", label: "Neon Green", className: "theme-green" },
];

const LOCAL_STORAGE_THEME_KEY = "rocket-meme-theme";

export function ThemeSwitcher() {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>("blue"); // Default to "blue" (Logo Cyan)

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
      "theme-red",
      "theme-orange", 
      "theme-green"
    );

    const selectedThemeObject = themes.find(t => t.value === currentTheme);
    if (selectedThemeObject && selectedThemeObject.className) {
      // Check if the className is for the default theme which might be empty
      // The current logic in globals.css makes theme-blue (Logo Cyan) the :root default implicitly
      // if no other class is applied.
      // So, only add class if it's not the implicit default visual.
      // OR, more simply, always add the specific class, and :root handles the base.
      // For clarity, let's ensure :root sets Logo Cyan, and other classes override it.
      // If selectedThemeObject.value is the default theme (e.g., "blue" for Logo Cyan),
      // we don't need to add its specific class if :root already provides it.
      // However, to be safe and explicit, we add the class.
      document.documentElement.classList.add(selectedThemeObject.className);
    }
    
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
