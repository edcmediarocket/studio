
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { ADMIN_EMAIL } from '@/lib/firebase';

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier, fromSimulatedSubscription?: boolean) => void;
  isLoadingTier: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

const LOCAL_STORAGE_TIER_PREFIX = "rocketMemeUserTier_v2_"; // Added versioning to key in case of schema changes

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Free");
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      let newDeterminedTier: UserTier = "Free"; 
      const userTierKey = user ? `${LOCAL_STORAGE_TIER_PREFIX}${user.uid}` : null;

      if (user && user.email && userTierKey) {
        const savedTier = localStorage.getItem(userTierKey) as UserTier | null;
        
        if (savedTier && ["Free", "Basic", "Pro", "Premium"].includes(savedTier)) {
          newDeterminedTier = savedTier;
        } else {
          // No valid tier in localStorage or first time for this user. Determine by email.
          if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            newDeterminedTier = "Premium";
          } else if (user.email.toLowerCase() === "premium@rocketmeme.com") {
            newDeterminedTier = "Premium";
          } else if (user.email.toLowerCase() === "pro@rocketmeme.com") {
            newDeterminedTier = "Pro";
          } else if (user.email.toLowerCase() === "basic@rocketmeme.com") {
            newDeterminedTier = "Basic";
          } else {
            newDeterminedTier = "Free"; // Default if no special email match
          }
          
          // Persist this newly determined (or re-determined if localStorage was invalid) tier
          try {
            localStorage.setItem(userTierKey, newDeterminedTier);
          } catch (e) {
            console.error("TierProvider: Failed to save email-determined tier to localStorage", e);
          }
        }
      } else {
        // No user logged in, or user.email/userTierKey is not available.
        // Tier remains "Free" as per initial newDeterminedTier.
      }
      
      _setCurrentTierInternal(newDeterminedTier);
      setIsLoadingTier(false);
    });

    return () => unsubscribe();
  }, []); // Dependency array is empty for onAuthStateChanged

  const setCurrentTier = useCallback((tier: UserTier, fromSimulatedSubscription: boolean = false) => {
    const oldTier = currentTier; // Capture old tier before updating
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

    // Show toast only for explicit user actions resulting in a tier change,
    // and only if a user is logged in and the tier actually changed.
    if (fromSimulatedSubscription && !isLoadingTier && currentUser && tier !== oldTier) { 
      toast({
        title: "Subscription Updated",
        description: `You are now on the ${tier} plan. Features have been updated.`,
        variant: "default",
      });
    }
  }, [toast, isLoadingTier, currentTier]); // Added currentTier to deps for toast logic

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
