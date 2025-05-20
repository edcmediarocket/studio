
"use client";

import React from "react"; // Ensure React is imported
import { Logo } from "@/components/icons/logo";
import { cn } from "@/lib/utils";

interface SplashScreenProps {
  onFinished: () => void;
}

export function SplashScreen({ onFinished }: SplashScreenProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setIsVisible(false); // Start fade-out
    }, 2000); // Duration logo is fully visible

    const unmountTimer = setTimeout(() => {
      onFinished(); // Signal to parent to unmount
    }, 2500); // Total splash screen duration (2000ms visible + 500ms fade)

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(unmountTimer);
    };
  }, [onFinished]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-primary transition-opacity duration-500 ease-in-out",
        !isVisible && "opacity-0 pointer-events-none" // Apply opacity for fade-out and disable pointer events
      )}
      aria-hidden={!isVisible}
    >
      <div className="animate-pulse"> {/* Optional: add subtle animation to logo */}
        <Logo className="h-24 w-auto sm:h-32 md:h-40 text-primary-foreground" /> {/* Increased size & ensure contrast */}
      </div>
      <p className="mt-4 text-xl sm:text-2xl font-semibold text-primary-foreground/90 tracking-tight">
        Your Launchpad for Meme Coin Insights.
      </p>
    </div>
  );
}
