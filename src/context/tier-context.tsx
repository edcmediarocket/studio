
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo } from 'react';

export type UserTier = "Free" | "Basic" | "Pro" | "Premium"; // Added Premium

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier) => void;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, setCurrentTier] = useState<UserTier>("Free"); // Default to Free

  const value = useMemo(() => ({
    currentTier,
    setCurrentTier,
  }), [currentTier]);

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}
