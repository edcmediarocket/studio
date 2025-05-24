
"use client";

import { SubscriptionTiers } from "@/components/account/subscription-tiers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Edit3, ShoppingCart, Save, ImagePlus, UploadCloud, Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react'; // Import useRef
import { useTier } from '@/context/tier-context';
import { auth, storage } from '@/lib/firebase'; // Import storage
import { updateProfile, type User as FirebaseUser } from 'firebase/auth';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage imports
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
  const { currentTier, setCurrentTier } = useTier();
  const { toast } = useToast();

  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [userName, setUserName] = useState("User");
  const [userEmail, setUserEmail] = useState("user@example.com");
  const [userAvatar, setUserAvatar] = useState("https://placehold.co/200x200.png?text=RM"); // Default placeholder
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state for editing
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  
  // State for file upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setFirebaseUser(user);
      if (user) {
        const currentDisplayName = user.displayName || user.email?.split('@')[0] || "User";
        const currentEmail = user.email || "user@example.com";
        const currentAvatar = user.photoURL || "https://placehold.co/200x200.png?text=" + currentDisplayName.charAt(0).toUpperCase();

        setUserName(currentDisplayName);
        setUserEmail(currentEmail);
        setUserAvatar(currentAvatar);

        setEditName(currentDisplayName);
        setEditEmail(currentEmail);
        setImagePreviewUrl(currentAvatar); // Initialize preview with current avatar
      } else {
        setUserName("User");
        setUserEmail("user@example.com");
        setUserAvatar("https://placehold.co/200x200.png?text=U");
        setEditName("User");
        setEditEmail("user@example.com");
        setImagePreviewUrl("https://placehold.co/200x200.png?text=U");
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleEditToggle = () => {
    if (!isEditingProfile) {
      setEditName(userName);
      setEditEmail(userEmail);
      setImagePreviewUrl(userAvatar); // Reset preview to current avatar when entering edit mode
      setSelectedFile(null); // Clear any previously selected file
    }
    setIsEditingProfile(!isEditingProfile);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedFile(null);
      setImagePreviewUrl(userAvatar); // Revert to current if invalid file
      toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
    }
  };

  const handleProfileUpdate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!firebaseUser) {
      toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
      return;
    }
    setIsSaving(true);

    let newPhotoURL = userAvatar; // Default to current avatar

    if (selectedFile) {
      // --- Actual Firebase Storage Upload Logic (conceptual, requires setup) ---
      // const filePath = `profileImages/${firebaseUser.uid}/${selectedFile.name}`;
      // const fileStorageRef = storageRef(storage, filePath);
      // try {
      //   const uploadTask = uploadBytesResumable(fileStorageRef, selectedFile);
      //   await uploadTask; // Wait for upload to complete
      //   newPhotoURL = await getDownloadURL(uploadTask.snapshot.ref);
      //   console.log("File uploaded, URL:", newPhotoURL);
      // } catch (storageError: any) {
      //   console.error("Firebase Storage upload error:", storageError);
      //   toast({ title: "Upload Failed", description: `Could not upload image: ${storageError.message}`, variant: "destructive" });
      //   setIsSaving(false);
      //   return;
      // }
      // --- End of Actual Upload Logic ---

      // --- Simulated Upload for Demo ---
      if (imagePreviewUrl && imagePreviewUrl.startsWith('data:image')) {
         newPhotoURL = imagePreviewUrl; // For demo, use the base64 preview. In production, use actual Storage URL.
         toast({ title: "Image Selected (Simulated Upload)", description: "Using local preview. Real upload needs Firebase Storage setup."});
      } else {
         newPhotoURL = userAvatar; // Fallback if preview is not a data URL (should not happen with current logic)
      }
      // --- End of Simulated Upload ---
    }

    try {
      await updateProfile(firebaseUser, {
        displayName: editName,
        photoURL: newPhotoURL, 
      });
      
      setUserName(editName);
      setUserAvatar(newPhotoURL);
      setUserEmail(editEmail); // Note: Email changes not propagated to Firebase Auth here

      toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
      setIsEditingProfile(false);
      setSelectedFile(null); // Clear selected file after saving
      // imagePreviewUrl will be updated by the useEffect listening to auth changes or can be set directly:
      // setImagePreviewUrl(newPhotoURL); 
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

  const avatarSrc = isEditingProfile ? (imagePreviewUrl || userAvatar) : userAvatar;
  const avatarFallbackText = (isEditingProfile ? editName : userName).charAt(0).toUpperCase() || "U";

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
              <AvatarImage src={avatarSrc} alt={isEditingProfile ? editName : userName} data-ai-hint="avatar abstract"/>
              <AvatarFallback className="text-2xl">{avatarFallbackText}</AvatarFallback>
            </Avatar>
            {isEditingProfile && (
                <>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                    disabled={isSaving}
                  />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                      <UploadCloud className="mr-2 h-4 w-4"/> Upload New Photo
                  </Button>
                </>
            )}
          </div>

          {isEditingProfile ? (
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <Label htmlFor="userName">Name</Label>
                <Input id="userName" value={editName} onChange={(e) => setEditName(e.target.value)} disabled={isSaving} />
              </div>
              <div>
                <Label htmlFor="userEmail">Email (Display Only)</Label>
                <Input id="userEmail" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} disabled={isSaving} />
                <p className="text-xs text-muted-foreground mt-1">Note: Email changes here are for display. Updating Firebase Auth email requires re-authentication (not implemented in this demo).</p>
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Changes"}
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
