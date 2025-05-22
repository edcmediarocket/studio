
"use client";

import { useAuthState } from 'react-firebase-hooks/auth';
import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase'; // Corrected import path
import { doc, getDoc } from 'firebase/firestore';
import AdminDashboard from './AdminDashboard';
import { Loader2, ShieldAlert } from 'lucide-react';

const AdminGate = () => {
  const [user, loadingAuth, errorAuth] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    console.log("AdminGate: useEffect triggered. User:", user ? user.uid : null, "LoadingAuth:", loadingAuth, "AuthError:", errorAuth ? errorAuth.message : null);
    if (user) {
      const checkAdmin = async () => {
        console.log("AdminGate: checkAdmin started for user:", user.uid);
        setLoadingRole(true);
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().role === 'admin') {
            console.log("AdminGate: User is admin. Firestore data:", docSnap.data());
            setIsAdmin(true);
          } else {
            console.log("AdminGate: User is NOT admin or doc doesn't exist/no role field. Doc exists:", docSnap.exists(), "Data:", docSnap.exists() ? docSnap.data() : 'No doc');
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("AdminGate: Error checking admin role in Firestore:", error);
          setIsAdmin(false);
        } finally {
          setLoadingRole(false);
          console.log("AdminGate: checkAdmin finished.");
        }
      };
      checkAdmin();
    } else if (!loadingAuth) {
      console.log("AdminGate: No user and auth not loading. Setting isAdmin to false.");
      setIsAdmin(false);
      setLoadingRole(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [user, loadingAuth]); // db is stable, errorAuth can be added if its change should re-trigger

  if (loadingAuth || loadingRole) {
    console.log("AdminGate: Rendering loading state. LoadingAuth:", loadingAuth, "LoadingRole:", loadingRole);
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Verifying access...</p>
      </div>
    );
  }

  if (errorAuth) {
     console.error("AdminGate: Firebase auth error detected during render:", errorAuth);
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Authentication Error</h1>
        <p className="text-muted-foreground">Could not verify your authentication status: {errorAuth.message}</p>
        <p className="text-xs text-muted-foreground mt-1">Please try refreshing the page.</p>
      </div>
    );
  }
  
  if (!user) {
     console.log("AdminGate: Rendering 'Access Denied - Not Logged In' state because user object is null/undefined.");
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You must be logged in to view this page.</p>
      </div>
    );
  }

  console.log("AdminGate: Rendering main content. IsAdmin:", isAdmin);
  return isAdmin ? <AdminDashboard /> : (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
      <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
      <p className="text-muted-foreground">You do not have permission to view this page.</p>
      <p className="text-xs text-muted-foreground mt-2">(Ensure your user document in Firestore at 'users/{user.uid}' has a 'role' field set to 'admin'.)</p>
    </div>
  );
};

export default AdminGate;
