
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth } from '@/lib/firebase'; // Import Firebase auth
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

export type UserTier = "Free" | "Basic" | "Pro" | "Premium";

interface TierContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier, fromAuth?: boolean) => void; // Added fromAuth to prevent toast for initial auth set
  isLoadingTier: boolean;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export function TierProvider({ children }: PropsWithChildren) {
  const [currentTier, _setCurrentTierInternal] = useState<UserTier>("Premium"); // Default before auth check
  const [isLoadingTier, setIsLoadingTier] = useState(true);
  const { toast } = useToast();

  const setCurrentTier = useCallback((tier: UserTier, fromAuth: boolean = false) => {
    _setCurrentTierInternal(tier);
    if (!fromAuth) { // Only show toast for manual changes, not initial auth load
      toast({
        title: "Subscription Updated",
        description: `You are now on the ${tier} plan.`,
        variant: "default",
      });
    }
  }, [toast]);

  useEffect(() => {
    setIsLoadingTier(true);
    const unsubscribe = onAuthStateChanged(auth, (user: FirebaseUser | null) => {
      if (user) {
        // Simulate fetching tier from Firestore based on user's email for demo
        let fetchedTier: UserTier = "Free"; // Default to Free
        if (user.email === "premium@rocketmeme.com") {
          fetchedTier = "Premium";
        } else if (user.email === "pro@rocketmeme.com") {
          fetchedTier = "Pro";
        } else if (user.email === "basic@rocketmeme.com") {
          fetchedTier = "Basic";
        }
        // In a real app, you'd fetch from Firestore:
        // const userDoc = await getDoc(doc(db, "users", user.uid));
        // if (userDoc.exists() && userDoc.data().subscription?.tier) {
        //   fetchedTier = userDoc.data().subscription.tier;
        // }
        console.log(`User ${user.email} logged in. Simulated fetched tier: ${fetchedTier}`);
        _setCurrentTierInternal(fetchedTier); // Update without toast for auth-driven change
      } else {
        // User is signed out, default to Free tier
        console.log("User signed out. Setting tier to Free.");
        _setCurrentTierInternal("Free"); // Update without toast
      }
      setIsLoadingTier(false);
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
