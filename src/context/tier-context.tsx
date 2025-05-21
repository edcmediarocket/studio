
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth, ADMIN_EMAIL, db } from '@/lib/firebase'; // Import ADMIN_EMAIL and db
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
// import { doc, getDoc, onSnapshot } from 'firebase/firestore'; // Example for real Firestore integration

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier, fromSimulatedSubscription?: boolean) => void;
  isLoadingTier: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

const LOCAL_STORAGE_TIER_PREFIX = "rocketMemeUserTier_v2_";

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Free");
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      const oldTier = currentTier; // Capture old tier before update
      
      if (user && user.email && user.uid) {
        const userTierKey = `${LOCAL_STORAGE_TIER_PREFIX}${user.uid}`;
        const savedTier = localStorage.getItem(userTierKey) as UserTier | null;
        let determinedTier: UserTier;

        if (savedTier && ["Free", "Basic", "Pro", "Premium"].includes(savedTier)) {
          determinedTier = savedTier;
          // console.log(`TierProvider: Loaded tier '${determinedTier}' for user ${user.uid} from localStorage.`);
        } else {
          // No valid tier in localStorage or first time for this user. Determine by email.
          if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) { // Admin gets Premium
            determinedTier = "Premium";
          } else if (user.email.toLowerCase() === "premium@rocketmeme.com") { // Demo premium email
            determinedTier = "Premium";
          } else if (user.email.toLowerCase() === "pro@rocketmeme.com") { // Demo pro email
            determinedTier = "Pro";
          } else if (user.email.toLowerCase() === "basic@rocketmeme.com") { // Demo basic email
            determinedTier = "Basic";
          } else {
            determinedTier = "Free"; // Default if no special email match
          }
          
          // Persist this newly determined (or re-determined if localStorage was invalid) tier
          try {
            localStorage.setItem(userTierKey, determinedTier);
            // console.log(`TierProvider: Saved email-determined tier '${determinedTier}' for user ${user.uid} to localStorage.`);
          } catch (e) {
            console.error("TierProvider: Failed to save email-determined tier to localStorage", e);
          }
        }
        _setCurrentTierInternal(determinedTier);
        // Toast logic moved to explicit setCurrentTier to avoid firing on initial load
      } else {
        _setCurrentTierInternal("Free");
      }
      setIsLoadingTier(false);
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // currentTier removed from deps to avoid loop with oldTier comparison

  const setCurrentTier = useCallback((tier: UserTier, fromSimulatedSubscription: boolean = false) => {
    const oldTierForToast = currentTier; // Capture current tier before _setCurrentTierInternal updates it
    _setCurrentTierInternal(tier);
    const currentUser = auth.currentUser;

    if (currentUser && currentUser.uid) {
      const userTierKey = `${LOCAL_STORAGE_TIER_PREFIX}${currentUser.uid}`;
      try {
        localStorage.setItem(userTierKey, tier);
        // console.log(`TierProvider: User explicitly set tier '${tier}' for user ${currentUser.uid} to localStorage.`);
      } catch (e) {
        console.error("TierProvider: Failed to save tier to localStorage on explicit action", e);
      }
    }

    // Show toast only for explicit user actions resulting in a tier change,
    // and only if the tier actually changed.
    if (fromSimulatedSubscription && tier !== oldTierForToast) { 
      toast({
        title: "Subscription Updated",
        description: `You are now on the ${tier} plan. Features have been updated.`,
        variant: "default",
      });
    }
  }, [toast, currentTier]); // currentTier is needed here for comparison in toast logic

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
