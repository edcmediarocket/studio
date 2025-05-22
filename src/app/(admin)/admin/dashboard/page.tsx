
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { getFirestore, collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { app } from '@/lib/firebase'; // Use app from firebase config
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
import { Loader2, ShieldAlert, Trash2, UserCircle } from "lucide-react";
import type { UserTier } from '@/context/tier-context';

interface UserData {
  id: string;
  email?: string;
  tier?: UserTier;
}

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authCheckLoading, setAuthCheckLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<UserTier | "all">("all");

  const { toast } = useToast();
  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    setAuthCheckLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          try {
            // Force refresh of the ID token to get latest custom claims
            const tokenResult = await user.getIdTokenResult(true); 
            if (tokenResult.claims.admin === true) {
              setIsAdmin(true);
            } else {
              setIsAdmin(false);
              // Removed toast here as it might be too early if authCheckLoading is still true
            }
          } catch (error) {
            console.error("AdminDashboard: Error getting ID token result:", error);
            setIsAdmin(false);
            // Removed toast here
          }
        } else {
          setIsAdmin(false); // No user logged in
        }
      } catch (e) {
        // Catch any unexpected errors within the onAuthStateChanged callback itself
        console.error("AdminDashboard: Error in onAuthStateChanged callback:", e);
        setIsAdmin(false);
      } finally {
        // This will always run, ensuring the loading spinner stops
        setAuthCheckLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]); // Removed toast from dependencies as it's not directly used in this effect's core logic for setting state

  useEffect(() => {
    if (authCheckLoading) return; // Wait for auth check to complete

    if (!isAdmin || !currentUser) {
      setLoadingUsers(false);
      if (currentUser && !isAdmin) {
        setUsers([]); 
      }
      return;
    }

    setLoadingUsers(true);
    const usersQuery = query(collection(db, 'users'), orderBy("email"));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const fetchedUsers: UserData[] = snapshot.docs.map(docSnapshot => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<UserData, 'id'>)
      }));
      setUsers(fetchedUsers);
      setLoadingUsers(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
      setLoadingUsers(false);
    });

    return () => unsubscribeUsers();
  }, [isAdmin, currentUser, db, toast, authCheckLoading]);

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
      toast({ title: "Error", description: "Failed to update user tier.", variant: "destructive" });
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
      toast({ title: "Error", description: "Failed to delete user document.", variant: "destructive" });
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
    // Show toast only once after loading is done and user is not admin
    useEffect(() => {
      if(!authCheckLoading && currentUser && !isAdmin) {
        toast({ title: "Access Denied", description: "You do not have the necessary permissions to view this page. Admin role via custom claims required.", variant: "destructive" });
      }
    }, [authCheckLoading, currentUser, isAdmin, toast]);

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You do not have the necessary permissions to view this page.</p>
        <p className="text-xs text-muted-foreground mt-1">(Admin role via custom claims required)</p>
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
            {(["Free", "Basic", "Pro", "Premium"] as UserTier[]).map(tier => (
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
                    <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs" title={u.email}>{u.email}</TableCell>
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
                          {(["Free", "Basic", "Pro", "Premium"] as UserTier[]).map(tierOpt => (
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
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <p className="text-xs text-muted-foreground pt-2 text-center">Note: Deleting a user document here removes it from Firestore but does not delete their Firebase Authentication account.</p>
        </>
      )}
    </div>
  );
}
