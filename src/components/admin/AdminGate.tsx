
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase'; // Corrected import path
import { doc, getDoc } from 'firebase/firestore';
import AdminDashboard from './AdminDashboard'; // Assuming AdminDashboard is in the same directory
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminGate = () => {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        setLoadingRole(true);
        try {
          // For this gate, we are checking a 'role' field in the user's document.
          // This document should be in a 'users' collection, and the doc ID is the user's UID.
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().role === 'admin') {
            setIsAdmin(true);
          } else {
            setIsAdmin(false); // Explicitly set to false if not admin
          }
        } catch (error) {
          console.error("Error checking admin role:", error);
          setIsAdmin(false); // Assume not admin on error
        } finally {
          setLoadingRole(false);
        }
      };
      checkAdmin();
    } else if (!loadingAuth) { // If no user and auth is not loading, they are not admin
      setIsAdmin(false);
      setLoadingRole(false);
    }
  }, [user, loadingAuth]);

  if (loadingAuth || loadingRole) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (errorAuth) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
        <p className="text-muted-foreground">Could not verify your authentication status: {errorAuth.message}</p>
      </div>
    );
  }
  
  if (!user) { // If still no user after loading, means not logged in
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to view this page.</p>
      </div>
    );
  }

  return isAdmin ? <AdminDashboard /> : (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
      <p className="text-muted-foreground">You do not have permission to view this page.</p>
      <p className="text-xs text-muted-foreground mt-2">(Ensure your user document in Firestore has a 'role' field set to 'admin'.)</p>
    </div>
  );
};

export default AdminGate;
