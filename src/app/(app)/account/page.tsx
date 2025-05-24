
"use client";

import { SubscriptionTiers } from "@/components/account/subscription-tiers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Edit3, ShoppingCart, Save, ImagePlus } from "lucide-react";
import { useState, useEffect } from 'react';
import { useTier } from '@/context/tier-context';
import { auth } from '@/lib/firebase';
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

const placeholderAvatars = [
  "https://placehold.co/200x200.png?text=RM1",
  "https://placehold.co/200x200.png?text=RM2",
  "https://placehold.co/200x200.png?text=RM3",
  "https://placehold.co/200x200.png?text=AB",
  "https://placehold.co/200x200.png?text=CD",
];

export default function AccountPage() {
  const { currentTier, setCurrentTier } = useTier();
  const { toast } = useToast();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userAvatar, setUserAvatar] = useState(placeholderAvatars[0]);
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAvatar, setEditAvatar] = useState(placeholderAvatars[0]); // Initialize editAvatar

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setFirebaseUser(user);
      if (user) {
        const currentDisplayName = user.displayName || user.email?.split('@')[0] || "User";
        const currentEmail = user.email || "user@example.com";
        const currentAvatar = user.photoURL || placeholderAvatars[0];

        setUserName(currentDisplayName);
        setUserEmail(currentEmail);
        setUserAvatar(currentAvatar);

        // Initialize edit fields when user data loads
        setEditName(currentDisplayName);
        setEditEmail(currentEmail);
        setEditAvatar(currentAvatar);
      } else {
        // Reset if user logs out
        setUserName("User");
        setUserEmail("user@example.com");
        setUserAvatar(placeholderAvatars[0]);
        setEditName("User");
        setEditEmail("user@example.com");
        setEditAvatar(placeholderAvatars[0]);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEditToggle = () => {
    if (!isEditingProfile) {
      // Entering edit mode, sync edit fields with current state
      setEditName(userName);
      setEditEmail(userEmail);
      setEditAvatar(userAvatar);
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleSimulateAvatarChange = () => {
    const currentIndex = placeholderAvatars.indexOf(editAvatar);
    let nextIndex = (currentIndex + 1) % placeholderAvatars.length;
    // Ensure it doesn't pick the same if current one is not in the list or list is short
    if (placeholderAvatars[nextIndex] === editAvatar && placeholderAvatars.length > 1) {
      nextIndex = (nextIndex + 1) % placeholderAvatars.length;
    }
    setEditAvatar(placeholderAvatars[nextIndex] || placeholderAvatars[0]);
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseUser) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile(firebaseUser, {
        displayName: editName,
        photoURL: editAvatar, 
      });
      // Update local state to reflect changes immediately
      setUserName(editName);
      setUserAvatar(editAvatar);
      // Note: We are not updating email in Firebase here due to re-authentication complexity.
      // We'll update the local display for email for now.
      setUserEmail(editEmail); 

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      setIsEditingProfile(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({ title: "Update Failed", description: error.message || "Could not update profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (authLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">Loading account details...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <UserCircle className="mr-3 h-8 w-8" /> Account Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your profile, subscription, and settings for Rocket Meme. Current Tier: <span className="font-semibold text-neon">{currentTier}</span>
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-primary">My Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleEditToggle} title={isEditingProfile ? "Cancel Edit" : "Edit Profile"}>
              {isEditingProfile ? <Save className="h-5 w-5 text-green-500" /> : <Edit3 className="h-5 w-5" />}
            </Button>
          </div>
          <CardDescription>View and update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src={isEditingProfile ? editAvatar : userAvatar} alt={isEditingProfile ? editName : userName} data-ai-hint="avatar abstract"/>
              <AvatarFallback className="text-2xl">{(isEditingProfile ? editName : userName).charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isEditingProfile && (
                <Button variant="outline" onClick={handleSimulateAvatarChange} disabled={isSaving}>
                    <ImagePlus className="mr-2 h-4 w-4"/> Change Avatar (Simulated)
                </Button>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="userName">Name</Label>
                <Input id="userName" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isSaving} />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input id="userEmail" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} disabled={isSaving} />
                <p className="text-xs text-muted-foreground mt-1">Note: Email changes require verification (not fully implemented in this demo).</p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)} disabled={isSaving}>Cancel</Button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="text-lg font-semibold">{userName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-lg font-semibold">{userEmail}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg" id="subscription">
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6" /> Subscription Plans
          </CardTitle>
          <CardDescription>Choose the plan that best fits your Rocket Meme trading strategy. Your current tier is <span className="font-semibold text-neon">{currentTier}</span>.</CardDescription>
        </CardHeader>
        <CardContent>
            <SubscriptionTiers currentActiveTier={currentTier} onTierChange={setCurrentTier} />
        </CardContent>
      </Card>
    </div>
  );
}
