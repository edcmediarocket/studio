
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { ADMIN_EMAIL } from '@/lib/firebase'; // Make sure ADMIN_EMAIL is imported

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier, fromSimulatedSubscription?: boolean) => void;
  isLoadingTier: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

const LOCAL_STORAGE_TIER_PREFIX = "rocketMemeUserTier_";

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Free");
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      let determinedTier: UserTier = "Free"; // Ultimate default
      const localStorageKey = user ? `${LOCAL_STORAGE_TIER_PREFIX}${user.uid}` : null;

      if (user && localStorageKey) {
        const savedPurchasedTier = localStorage.getItem(localStorageKey) as UserTier | null;

        if (savedPurchasedTier && ["Free", "Basic", "Pro", "Premium"].includes(savedPurchasedTier)) {
          determinedTier = savedPurchasedTier;
          console.log(`Loaded tier '${determinedTier}' from localStorage (user's explicit choice) for ${user.email}`);
        } else {
          // No explicit/valid choice in localStorage, determine tier based on email
          let emailBasedTier: UserTier = "Free";
          if (user.email === ADMIN_EMAIL || user.email === "premium@rocketmeme.com") {
            emailBasedTier = "Premium";
          } else if (user.email === "pro@rocketmeme.com") {
            emailBasedTier = "Pro";
          } else if (user.email === "basic@rocketmeme.com") {
            emailBasedTier = "Basic";
          }
          // else it remains "Free" as initialized for emailBasedTier
          
          determinedTier = emailBasedTier;
          console.log(`Determined tier '${determinedTier}' based on email (no localStorage override) for ${user.email}`);
          
          // Persist this email-based tier to localStorage if it was determined (i.e., make it the default "saved" choice)
          // This makes the email-based tier sticky until explicitly changed by a "purchase".
          try {
            localStorage.setItem(localStorageKey, determinedTier);
            console.log(`Persisted determined tier '${determinedTier}' to localStorage for ${user.email}`);
          } catch (e) {
            console.error("Failed to persist determined tier to localStorage", e);
          }
        }
      } else {
        // User is signed out
        determinedTier = "Free";
        console.log("User signed out. Setting tier to Free.");
        // If there was a previous user, their localStorage item remains, but won't be loaded for a null user.
      }
      
      _setCurrentTierInternal(determinedTier);
      setIsLoadingTier(false);
      // Avoid toast on initial auth load by not passing `fromSimulatedSubscription=true`
    });

    return () => unsubscribe();
  }, []); // Empty dependency array ensures this runs once on mount

  const setCurrentTier = useCallback((tier: UserTier, fromSimulatedSubscription: boolean = false) => {
    _setCurrentTierInternal(tier);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_TIER_PREFIX}${currentUser.uid}`, tier);
        console.log(`Saved tier '${tier}' to localStorage (explicit action) for ${currentUser.email}`);
      } catch (e) {
        console.error("Failed to save tier to localStorage on explicit action", e);
      }
    }

    // Show toast only for explicit user actions that are not part of the initial loading phase
    if (fromSimulatedSubscription && !isLoadingTier) { 
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
