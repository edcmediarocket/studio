
"use client";

import { useState, useEffect } from "react";

const MOBILE_BREAKPOINT = 768; // md

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    // This function runs only on initial state creation
    if (typeof window !== "undefined") {
      return window.innerWidth < MOBILE_BREAKPOINT;
    }
    // SSR fallback or if window is not defined during very initial client render.
    // Default to false. useEffect will correct it on client mount.
    return false; 
  });

  useEffect(() => {
    // This effect runs after the component mounts on the client.
    // It ensures the state is accurate and sets up the listener.
    if (typeof window === "undefined") {
      return; 
    }

    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Call once on mount to ensure the value is correct,
    // especially if the useState initializer's window check didn't run or was initially incorrect.
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

  return isMobile; // Return the boolean state directly.
}
