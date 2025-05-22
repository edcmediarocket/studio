
"use client";

import React, { useEffect, useState } from 'react';
import { db, auth } from '@/lib/firebase'; // Assuming auth might be needed for user context later
import { collection, getDocs, updateDoc, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Trash2, UserCog } from "lucide-react";
import type { UserTier } from '@/context/tier-context';

interface User {
  id: string; // Corresponds to Firebase UID
  email?: string;
  tier?: UserTier;
  // Add any other fields you expect from your users collection
  displayName?: string; 
  photoURL?: string;
  createdAt?: any; // Firestore timestamp or ISO string
  subscription?: {
    status?: string;
    [key: string]: any;
  };
}

const tierOptions: UserTier[] = ["Free", "Basic", "Pro", "Premium"];

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterTier, setFilterTier] = useState<UserTier | "all">("all");
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersQuery = query(collection(db, 'users'), orderBy("email")); // Order by email for consistency
      const snapshot = await getDocs(usersQuery);
      const data: User[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<User, 'id'>) // Assert data matches User structure
      }));
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Error", description: "Failed to fetch users.", variant: "destructive" });
    }
    setLoading(false);
  };

  const handleUpdateTier = async (userId: string, newTier: UserTier) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      await updateDoc(userDocRef, {
        tier: newTier,
        updatedAt: new Date().toISOString(), // Or use FieldValue.serverTimestamp() if preferred
      });
      toast({ title: "Success", description: `User tier updated to ${newTier}.` });
      fetchUsers(); // Re-fetch to show updated data
    } catch (error) {
      console.error("Error updating tier:", error);
      toast({ title: "Error", description: "Failed to update user tier.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const userDocRef = doc(db, 'users', userId);
      // Note: Deleting a user document in Firestore does NOT delete their Firebase Auth account.
      // That requires using the Firebase Admin SDK on a backend.
      await deleteDoc(userDocRef);
      toast({ title: "Success", description: "User document deleted from Firestore." });
      fetchUsers(); // Re-fetch to show updated data
    } catch (error) {
      console.error("Error deleting user document:", error);
      toast({ title: "Error", description: "Failed to delete user document.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchUsers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredUsers = users
    .filter(user => filterTier === "all" || user.tier === filterTier)
    .filter(user => user.email?.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading users...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-card text-card-foreground rounded-lg shadow-xl">
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
            {tierOptions.map(tier => (
              <SelectItem key={tier} value={tier}>{tier}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

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
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs truncate max-w-[100px] sm:max-w-[150px]" title={user.id}>{user.id}</TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm truncate max-w-[150px] sm:max-w-xs" title={user.email}>{user.email}</TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-xs sm:text-sm capitalize">{user.tier || 'Free'}</TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3">
                  <Select
                    defaultValue={user.tier || 'Free'}
                    onValueChange={(newTier) => handleUpdateTier(user.id, newTier as UserTier)}
                  >
                    <SelectTrigger className="w-[120px] sm:w-[140px] h-9 text-xs bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tierOptions.map(tier => (
                        <SelectItem key={tier} value={tier}>{tier}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="px-3 py-2 sm:px-4 sm:py-3 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
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
    </div>
  );
}
