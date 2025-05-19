
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier, fromAuth?: boolean) => void;
  isLoadingTier: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

const LOCAL_STORAGE_TIER_PREFIX = "rocketMemeUserTier_";

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Free"); // Default to Free initially
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  const setCurrentTier = useCallback((tier: UserTier, fromAuth: boolean = false) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_TIER_PREFIX}${currentUser.uid}`, tier);
      } catch (error) {
        console.warn("Failed to save tier to localStorage:", error);
      }
    }
    _setCurrentTierInternal(tier);

    // Only show toast for manual changes, not initial auth load or localStorage load
    if (!fromAuth && !isLoadingTier) { 
      toast({
        title: "Subscription Updated",
        description: `You are now on the ${tier} plan.`,
        variant: "default",
      });
    }
  }, [toast, isLoadingTier]); // Added isLoadingTier to dependency

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      let newTier: UserTier = "Free"; // Default to Free
      if (user) {
        // 1. Try to load from localStorage first
        try {
          const savedTier = localStorage.getItem(`${LOCAL_STORAGE_TIER_PREFIX}${user.uid}`);
          if (savedTier && ["Free", "Basic", "Pro", "Premium"].includes(savedTier)) {
            newTier = savedTier as UserTier;
            console.log(`User ${user.email} logged in. Loaded tier from localStorage: ${newTier}`);
          } else {
            // 2. If not in localStorage, simulate fetching/defaulting based on email (for demo)
            if (user.email === "coreyenglish517@gmail.com" || user.email === "premium@rocketmeme.com") {
              newTier = "Premium";
            } else if (user.email === "pro@rocketmeme.com") {
              newTier = "Pro";
            } else if (user.email === "basic@rocketmeme.com") {
              newTier = "Basic";
            }
            console.log(`User ${user.email} logged in. No localStorage tier. Simulated fetched tier: ${newTier}`);
            // Save this simulated/default tier to localStorage for next time
             localStorage.setItem(`${LOCAL_STORAGE_TIER_PREFIX}${user.uid}`, newTier);
          }
        } catch (error) {
            console.warn("Failed to access localStorage for tier:", error);
            // Fallback to email-based simulation if localStorage fails
            if (user.email === "coreyenglish517@gmail.com" || user.email === "premium@rocketmeme.com") {
              newTier = "Premium";
            } else if (user.email === "pro@rocketmeme.com") {
              newTier = "Pro";
            } else if (user.email === "basic@rocketmeme.com") {
              newTier = "Basic";
            }
        }
        _setCurrentTierInternal(newTier); // Update without toast for auth-driven/localStorage change
      } else {
        // User is signed out, default to Free tier
        console.log("User signed out. Setting tier to Free.");
        _setCurrentTierInternal("Free"); // Update without toast
      }
      // Brief delay to allow other components to potentially read initial isLoadingTier=true state
      // This helps prevent the toast from showing on the very first load after localStorage has been read.
      setTimeout(() => setIsLoadingTier(false), 100); 
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
