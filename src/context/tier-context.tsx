
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth, ADMIN_EMAIL } from '@/lib/firebase'; // Import ADMIN_EMAIL
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier, fromSimulatedSubscription?: boolean) => void;
  isLoadingTier: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

const LOCAL_STORAGE_TIER_PREFIX = "rocketMemeUserTier_v2_"; // Keep or update version if structure changes

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Free");
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      let determinedTier: UserTier = "Free"; // Default to Free

      if (user && user.email && user.uid) {
        const userTierKey = `${LOCAL_STORAGE_TIER_PREFIX}${user.uid}`;
        const savedTierInStorage = localStorage.getItem(userTierKey) as UserTier | null;

        if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          // Admin email always gets Premium unless a specific tier was "purchased" and stored
          determinedTier = savedTierInStorage && ["Free", "Basic", "Pro", "Premium"].includes(savedTierInStorage)
            ? savedTierInStorage // If admin "purchased" a different tier, respect it
            : "Premium"; // Default for admin
        } else if (savedTierInStorage && ["Free", "Basic", "Pro", "Premium"].includes(savedTierInStorage)) {
          // For regular users, load their saved tier from localStorage
          determinedTier = savedTierInStorage;
        } else {
          // No specific tier saved for this regular user, or admin didn't have a specific saved tier, defaults to Free
          // (unless it's admin, who got Premium above)
           determinedTier = "Free";
        }
        
        // Persist the finally determined tier (admin override, localStorage, or default Free)
        // This makes the initial determination "sticky" for the next session.
        try {
          localStorage.setItem(userTierKey, determinedTier);
        } catch (e) {
          console.error("TierProvider: Failed to save determined tier to localStorage", e);
        }

      } else { // No user logged in
        determinedTier = "Free";
      }
      
      _setCurrentTierInternal(determinedTier);
      setIsLoadingTier(false);
    });

    return () => unsubscribe();
  }, []); // ADMIN_EMAIL is a const, no need to list as dep

  const setCurrentTier = useCallback((tier: UserTier, fromSimulatedSubscription: boolean = false) => {
    const oldTierForToast = currentTier;
    _setCurrentTierInternal(tier);
    const currentUser = auth.currentUser;

    if (currentUser && currentUser.uid) {
      const userTierKey = `${LOCAL_STORAGE_TIER_PREFIX}${currentUser.uid}`;
      try {
        localStorage.setItem(userTierKey, tier);
      } catch (e) {
        console.error("TierProvider: Failed to save tier to localStorage on explicit action", e);
      }
    }

    if (fromSimulatedSubscription && tier !== oldTierForToast) {
      toast({
        title: "Subscription Updated",
        description: `You are now on the ${tier} plan. Features have been updated.`,
        variant: "default",
      });
    }
  }, [toast, currentTier]);

  const value = useMemo(() => ({
    currentTier,
    setCurrentTier,
    isLoadingTier,
  }), [currentTier, setCurrentTier, isLoadingTier]);

  return <TierContext.Provider value={value}>{children}</TierContext.Provider>;
}

export function useTier() {
  const context = useContext(TierContext);
  if (context === undefined) {
    throw new Error('useTier must be used within a TierProvider');
  }
  return context;
}
