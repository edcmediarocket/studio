
"use client";

import { SubscriptionTiers } from "@/components/account/subscription-tiers";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Edit3, ShoppingCart } from "lucide-react"; // Added ShoppingCart
import { useState, useEffect } from 'react';
import { useTier } from '@/context/tier-context'; // Import useTier

export default function AccountPage() {
  const { currentTier, setCurrentTier } = useTier(); // Use the tier context
  const [userName, setUserName] = useState("Meme Lord");
  const [userEmail, setUserEmail] = useState("lord@memeprophet.com");
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Simulate fetching user data
  useEffect(() => {
    // In a real app, fetch from Firebase Auth / Firestore
    // And also fetch user's current subscription tier
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <UserCircle className="mr-3 h-8 w-8" /> Account Management
        </h1>
        <p className="text-lg text-muted-foreground">
          Manage your profile, subscription, and settings. Current Tier: <span className="font-semibold text-neon">{currentTier}</span>
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl text-primary">My Profile</CardTitle>
            <Button variant="ghost" size="icon" onClick={() => setIsEditingProfile(!isEditingProfile)}>
              <Edit3 className="h-5 w-5" />
            </Button>
          </div>
          <CardDescription>View and update your personal information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20 border-2 border-primary">
              <AvatarImage src="https://placehold.co/200x200.png" alt={userName} data-ai-hint="avatar abstract"/>
              <AvatarFallback className="text-2xl">{userName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isEditingProfile && <Button variant="outline">Change Avatar</Button>}
          </div>

          {isEditingProfile ? (
            <form className="space-y-4">
              <div>
                <Label htmlFor="userName">Name</Label>
                <Input id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="userEmail">Email</Label>
                <Input id="userEmail" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="bg-primary hover:bg-primary/90">Save Changes</Button>
                <Button variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
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
      
      <Card className="shadow-lg" id="subscription"> {/* Added ID for deep linking */}
        <CardHeader>
          <CardTitle className="text-2xl text-primary flex items-center">
            <ShoppingCart className="mr-2 h-6 w-6" /> Subscription Plans
          </CardTitle>
          <CardDescription>Choose the plan that best fits your meme coin trading strategy. Your current tier is <span className="font-semibold text-neon">{currentTier}</span>.</CardDescription>
        </CardHeader>
        <CardContent>
            {/* Pass currentTier and setCurrentTier to SubscriptionTiers */}
            <SubscriptionTiers currentActiveTier={currentTier} onTierChange={setCurrentTier} />
        </CardContent>
      </Card>

      {/* Placeholder for other settings like notifications, API keys etc. */}
    </div>
  );
}
