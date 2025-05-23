
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { getFirestore, collection, onSnapshot, updateDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Use your firebase app instance
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, ShieldAlert, Trash2, UserCircle, WifiOff } from "lucide-react"; // Added WifiOff
import type { UserTier } from '@/context/tier-context';

interface UserData {
  id: string; // Corresponds to Firebase UID
  email?: string;
  tier?: UserTier;
}

const TIER_OPTIONS: UserTier[] = ["Free", "Basic", "Pro", "Premium"];

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<UserTier | "all">("all");
  const [firestoreError, setFirestoreError] = useState<string | null>(null); // New state for Firestore errors

  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setAuthCheckLoading(true); // Start auth check loading
      try {
        setCurrentUser(user);
        if (user) {
          try {
            const tokenResult = await user.getIdTokenResult(true); // Force refresh
            if (tokenResult.claims.admin === true) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
            }
          } catch (error) {
            console.error("AdminDashboard: Error getting ID token result:", error);
            setIsAdmin(false);
          }
        } else {
          setIsAdmin(false);
        }
      } catch (e) {
        console.error("AdminDashboard: Auth state change error", e);
        setIsAdmin(false);
      } finally {
        setAuthCheckLoading(false); // Finish auth check loading
      }
    });
    return () => unsubscribeAuth();
  }, [auth]);

  useEffect(() => {
    if (!authCheckLoading && currentUser && !isAdmin) {
        toast({ title: "Access Denied", description: "You do not have the necessary permissions to view this page. Admin role via custom claims required.", variant: "destructive" });
    }
  }, [authCheckLoading, currentUser, isAdmin, toast]);

  useEffect(() => {
    if (authCheckLoading || !isAdmin) {
      setLoadingUsers(false);
      if(!authCheckLoading && !isAdmin && currentUser) {
        setUsers([]);
      }
      return;
    }

    setLoadingUsers(true);
    setFirestoreError(null); // Reset Firestore error on new attempt
    const usersQuery = query(collection(db, 'users'), orderBy("email"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const fetchedUsers: UserData[] = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<UserData, 'id'>)
      }));
      setUsers(fetchedUsers);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users from Firestore:", error);
      if (error.code === 'unavailable') {
        setFirestoreError("Could not connect to Firestore. Please check your internet connection and firewall settings. The service might be temporarily unavailable.");
      } else if (error.code === 'permission-denied') {
        setFirestoreError("Permission denied. Please check Firestore security rules to ensure admins have read access to the 'users' collection.");
      } else {
        setFirestoreError(`Failed to fetch users. Error: ${error.message}. Please check Firestore rules and ensure the 'users' collection exists.`);
      }
      toast({ title: "Firestore Error", description: firestoreError || "Failed to fetch users.", variant: "destructive" });
      setUsers([]);
      setLoadingUsers(false);
    });

    return () => unsubscribeUsers();
  }, [isAdmin, db, toast, authCheckLoading, currentUser, firestoreError]); // Added firestoreError to deps

  const handleTierChange = useCallback(async (userId: string, newTier: UserTier) => {
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission to change tiers.", variant: "destructive" });
      return;
    }
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, { tier: newTier });
      toast({ title: "Success", description: `User tier updated to ${newTier}.` });
    } catch (error) {
      console.error("Error updating tier:", error);
      toast({ title: "Error", description: "Failed to update user tier. Check Firestore rules.", variant: "destructive" });
    }
  }, [isAdmin, db, toast]);

  const handleDeleteUser = useCallback(async (userId: string) => {
    if (!isAdmin) {
      toast({ title: "Unauthorized", description: "You do not have permission to delete users.", variant: "destructive" });
      return;
    }
    if (!window.confirm("Are you sure you want to delete this user document? This action cannot be undone and does not delete their Firebase Auth account.")) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      await deleteDoc(userDocRef);
      toast({ title: "Success", description: "User document deleted from Firestore." });
    } catch (error) {
      console.error("Error deleting user document:", error);
      toast({ title: "Error", description: "Failed to delete user document. Check Firestore rules.", variant: "destructive" });
    }
  }, [isAdmin, db, toast]);

  const filteredUsers = users
    .filter(user => filterTier === "all" || user.tier === filterTier)
    .filter(user => user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (authCheckLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!currentUser) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to view the admin dashboard.</p>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You do not have the necessary permissions to view this page.</p>
        <p className="text-xs text-muted-foreground mt-1">(Admin role via custom claims required. If claim is set, it may take a moment to propagate after login.)</p>
      </div>
    );
  }
  
  if (firestoreError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <WifiOff className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Firestore Connection Error</h1>
        <p className="text-muted-foreground max-w-md">{firestoreError}</p>
        <Button onClick={() => setFirestoreError(null)} className="mt-4">Try Again</Button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-neon flex items-center">
        <UserCircle className="mr-3 h-8 w-8" /> Admin Dashboard
      </h1>
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Input
          placeholder="Search by email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:max-w-sm h-10 bg-background"
        />
        <Select value={filterTier} onValueChange={(value) => setFilterTier(value as UserTier | "all")}>
          <SelectTrigger className="w-full md:w-[180px] h-10 bg-background">
            <SelectValue placeholder="Filter by Tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            {TIER_OPTIONS.map(tier => (
              <SelectItem key={tier} value={tier}>{tier}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {loadingUsers ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="ml-2 text-muted-foreground">Loading users...</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">UID</TableHead>
                  <TableHead className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">Email</TableHead>
                  <TableHead className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">Current Tier</TableHead>
                  <TableHead className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm">Change Tier</TableHead>
                  <TableHead className="whitespace-nowrap px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs truncate max-w-[100px] sm:max-w-[150px]" title={u.id}>{u.id}</TableCell>
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs" title={u.email}>{u.email || 'N/A'}</TableCell>
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm capitalize">{u.tier || 'Free'}</TableCell>
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                      <Select
                        defaultValue={u.tier || 'Free'}
                        onValueChange={(newTierValue) => handleTierChange(u.id, newTierValue as UserTier)}
                      >
                        <SelectTrigger className="w-[120px] sm:w-[140px] h-9 text-xs bg-background">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TIER_OPTIONS.map(tierOpt => (
                            <SelectItem key={tierOpt} value={tierOpt}>{tierOpt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteUser(u.id)}
                        className="text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1 sm:mr-1.5" /> Delete User Doc
                      </Button>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                       No users found in Firestore matching your criteria. Ensure your 'users' collection is populated and your admin account has a corresponding document. Check Firestore security rules for read/list permissions if issues persist.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground pt-2 text-center">Note: Deleting a user document here removes it from Firestore but does not delete their Firebase Authentication account. This requires Admin SDK privileges typically run from a backend.</p>
        </>
      )}
    </div>
  );
}


    