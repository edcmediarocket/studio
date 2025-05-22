
"use client";

import type { PropsWithChildren } from 'react';
import React, { createContext, useState, useContext, useMemo, useCallback, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { auth, ADMIN_EMAILS, db } from '@/lib/firebase';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore';

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
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (!user) {
        // No user logged in, default to Free and clear local storage for safety
        _setCurrentTierInternal("Free");
        try {
            // Optionally clear any global tier key if one existed
            // localStorage.removeItem(SOME_GLOBAL_TIER_KEY_IF_ANY);
        } catch (e) {
            console.error("TierProvider: Failed to clear global tier from localStorage on logout", e);
        }
        setIsLoadingTier(false);
      }
      // If user is logged in, tier will be set by Firestore listener or fallback logic
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    let unsubscribeFirestore: Unsubscribe | undefined;

    if (currentUser && currentUser.uid) {
      setIsLoadingTier(true);
      const userTierKey = `${LOCAL_STORAGE_TIER_PREFIX}${currentUser.uid}`;
      
      // Attempt to load from localStorage first for immediate UI response
      try {
        const savedTierInStorage = localStorage.getItem(userTierKey) as UserTier | null;
        if (savedTierInStorage && ["Free", "Basic", "Pro", "Premium"].includes(savedTierInStorage)) {
          _setCurrentTierInternal(savedTierInStorage);
        }
      } catch (e) {
        console.error("TierProvider: Failed to load tier from localStorage", e);
      }

      // Listen to Firestore for real-time updates
      const userDocRef = doc(db, "users", currentUser.uid);
      unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
        let determinedTier: UserTier = "Free"; // Default

        if (docSnap.exists()) {
          const userData = docSnap.data();
          const firestoreTier = userData.tier as UserTier | undefined;
          // Assuming subscription status is also checked if relevant
          // const isActive = userData.subscription?.status === 'active';

          if (firestoreTier && ["Free", "Basic", "Pro", "Premium"].includes(firestoreTier)) {
            determinedTier = firestoreTier;
          }
        } else {
          // No Firestore document, apply email-based logic for initial default or admin override
          if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
            determinedTier = "Premium";
          } else {
            // Fallback to localStorage if no Firestore doc, then Free
             try {
                const savedTierInStorage = localStorage.getItem(userTierKey) as UserTier | null;
                if (savedTierInStorage && ["Free", "Basic", "Pro", "Premium"].includes(savedTierInStorage)) {
                    determinedTier = savedTierInStorage;
                } else {
                    determinedTier = "Free";
                }
             } catch (e) { /* already handled */ }
          }
        }
        
        _setCurrentTierInternal(determinedTier);
        try {
          localStorage.setItem(userTierKey, determinedTier); // Persist the Firestore-driven or default tier
        } catch (e) {
          console.error("TierProvider: Failed to save determined tier to localStorage", e);
        }
        setIsLoadingTier(false);
      }, (error) => {
        console.error("TierProvider: Error fetching tier from Firestore:", error);
        // Fallback to email/localStorage logic on Firestore error
        let fallbackTier: UserTier = "Free";
        if (currentUser.email && ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
            fallbackTier = "Premium";
        } else {
            try {
                const savedTierInStorage = localStorage.getItem(userTierKey) as UserTier | null;
                if (savedTierInStorage && ["Free", "Basic", "Pro", "Premium"].includes(savedTierInStorage)) {
                    fallbackTier = savedTierInStorage;
                }
            } catch (e) { /* already handled */ }
        }
        _setCurrentTierInternal(fallbackTier);
        try {
          localStorage.setItem(userTierKey, fallbackTier);
        } catch (e) {
          console.error("TierProvider: Failed to save fallback tier to localStorage", e);
        }
        setIsLoadingTier(false);
      });
    } else {
      // No user, ensure tier is Free
      _setCurrentTierInternal("Free");
      setIsLoadingTier(false);
    }

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [currentUser]);

  const setCurrentTier = useCallback((tier: UserTier, fromSimulatedSubscription: boolean = false) => {
    const oldTierForToast = currentTier; // Capture currentTier before it's updated by _setCurrentTierInternal
    _setCurrentTierInternal(tier);
    
    const activeUser = auth.currentUser; // Use auth.currentUser directly
    if (activeUser && activeUser.uid) {
      const userTierKey = `${LOCAL_STORAGE_TIER_PREFIX}${activeUser.uid}`;
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
  }, [toast, currentTier]); // currentTier dependency for oldTierForToast

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
