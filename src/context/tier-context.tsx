
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast"; // Import useToast

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier) => void;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTier] = useState<UserTier>("Premium"); // Default to Premium
  const { toast } = useToast(); // Get the toast function

  const setCurrentTier = useCallback((tier: UserTier) => {
    _setCurrentTier(tier);
    toast({
      title: "Subscription Updated",
      description: `You are now on the ${tier} plan.`,
      variant: "default", // Or use a different variant based on tier
    });
  }, [toast]); // Add toast to dependencies

  const value = useMemo(() => ({
    currentTier,
    setCurrentTier,
  }), [currentTier, setCurrentTier]); // Add setCurrentTier to dependencies

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}
