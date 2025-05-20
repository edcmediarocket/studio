
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier, fromSimulatedSubscription?: boolean) => void; // Added flag
  isLoadingTier: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

// No longer using localStorage directly here for tier, tier is "fetched"
// const LOCAL_STORAGE_TIER_PREFIX = "rocketMemeUserTier_"; 

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Free");
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  const setCurrentTier = useCallback((tier: UserTier, fromSimulatedSubscription: boolean = false) => {
    _setCurrentTierInternal(tier);

    // Only show toast for explicit actions, not initial load or silent updates
    if (fromSimulatedSubscription && !isLoadingTier) { 
      toast({
        title: "Subscription Updated",
        description: `You are now on the ${tier} plan. Features have been updated.`,
        variant: "default",
      });
    }
  }, [toast, isLoadingTier]);

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        // Simulate fetching user's tier from a backend/Firestore
        // For this demo, we'll base it on email
        console.log(`User ${user.email} logged in. Simulating fetch of tier...`);
        setTimeout(() => { // Simulate async fetch
          let fetchedTier: UserTier = "Free"; // Default
          if (user.email === "coreyenglish517@gmail.com" || user.email === "premium@rocketmeme.com") {
            fetchedTier = "Premium";
          } else if (user.email === "pro@rocketmeme.com") {
            fetchedTier = "Pro";
          } else if (user.email === "basic@rocketmeme.com") {
            fetchedTier = "Basic";
          }
          console.log(`Simulated fetched tier for ${user.email}: ${fetchedTier}`);
          _setCurrentTierInternal(fetchedTier);
          setIsLoadingTier(false);
        }, 500); // Simulate a short delay
      } else {
        // User is signed out, default to Free tier
        console.log("User signed out. Setting tier to Free.");
        _setCurrentTierInternal("Free");
        setIsLoadingTier(false);
      }
    });

    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);


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
