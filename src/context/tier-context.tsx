
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

const LOCAL_STORAGE_TIER_PREFIX = "rocketMemeUserTier_"; // Key prefix for localStorage

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Free");
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      let determinedTier: UserTier = "Free"; // Default if no user or no stored/email-based tier
      const userTierKey = user ? `${LOCAL_STORAGE_TIER_PREFIX}${user.uid}` : null;

      if (user && user.email && userTierKey) { // Ensure user and userTierKey exist
        const savedTier = localStorage.getItem(userTierKey) as UserTier | null;

        if (savedTier && ["Free", "Basic", "Pro", "Premium"].includes(savedTier)) {
          determinedTier = savedTier;
          // console.log(`Loaded tier '${determinedTier}' from localStorage for user ${user.uid}`);
        } else {
          // No valid tier in localStorage, determine by email
          let emailBasedTier: UserTier = "Free"; // Default to Free
          if (user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() || user.email.toLowerCase() === "premium@rocketmeme.com") {
            emailBasedTier = "Premium";
          } else if (user.email.toLowerCase() === "pro@rocketmeme.com") {
            emailBasedTier = "Pro";
          } else if (user.email.toLowerCase() === "basic@rocketmeme.com") {
            emailBasedTier = "Basic";
          }
          determinedTier = emailBasedTier;
          
          // Save this initially determined (or default "Free") tier to localStorage
          // console.log(`Determined tier '${determinedTier}' by email for user ${user.uid}, saving to localStorage.`);
          try {
            localStorage.setItem(userTierKey, determinedTier);
          } catch (e) {
            console.error("Failed to save initial/email-determined tier to localStorage", e);
          }
        }
      } else {
        // No user logged in, default to Free
        // console.log("No user logged in, setting tier to Free.");
        determinedTier = "Free"; // Ensure it's Free if no user
      }
      
      _setCurrentTierInternal(determinedTier);
      setIsLoadingTier(false);
    });

    return () => unsubscribe();
  }, []); // Empty dependency array is correct for onAuthStateChanged

  const setCurrentTier = useCallback((tier: UserTier, fromSimulatedSubscription: boolean = false) => {
    _setCurrentTierInternal(tier);
    const currentUser = auth.currentUser;

    if (currentUser && currentUser.uid) {
      const userTierKey = `${LOCAL_STORAGE_TIER_PREFIX}${currentUser.uid}`;
      try {
        localStorage.setItem(userTierKey, tier);
        // console.log(`Saved tier '${tier}' to localStorage for user ${currentUser.uid} due to explicit action.`);
      } catch (e) {
        console.error("Failed to save tier to localStorage on explicit action", e);
      }
    } else if (!currentUser && fromSimulatedSubscription) {
        console.warn("Attempted to set tier via subscription while not logged in.");
    }

    // Show toast only for explicit user actions resulting in a tier change, and only if a user is logged in
    if (fromSimulatedSubscription && !isLoadingTier && currentUser) { 
      toast({
        title: "Subscription Updated",
        description: `You are now on the ${tier} plan. Features have been updated.`,
        variant: "default",
      });
    }
  }, [toast, isLoadingTier]);

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
