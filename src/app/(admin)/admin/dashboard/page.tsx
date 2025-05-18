
"use client";

import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, Users, Settings } from "lucide-react";
import type { UserTier } from "@/context/tier-context";

interface SimulatedUser {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  tier: UserTier;
  joinedDate: string;
}

// Simulate a list of users. In a real app, this would come from a backend/Firebase Functions.
const simulatedUsers: SimulatedUser[] = [
  { id: "user1", email: "lord@rocketmeme.com", displayName: "Meme Lord", tier: "Premium", avatar: "https://placehold.co/40x40.png", joinedDate: "2024-01-15" },
  { id: "user2", email: "pro@rocketmeme.com", displayName: "Pro User", tier: "Pro", avatar: "https://placehold.co/40x40.png", joinedDate: "2024-02-20" },
  { id: "user3", email: "basic@rocketmeme.com", displayName: "Basic User", tier: "Basic", avatar: "https://placehold.co/40x40.png", joinedDate: "2024-03-10" },
  { id: "user4", email: "free@example.com", displayName: "Freebie", tier: "Free", avatar: "https://placehold.co/40x40.png", joinedDate: "2024-04-05" },
  { id: "user5", email: "another.user@example.com", displayName: "Jane Doe", tier: "Free", joinedDate: "2024-05-01" },
  { id: "user6", email: "admin@rocketmeme.com", displayName: "Admin User", tier: "Premium", joinedDate: "2023-12-01" },
];

export default function AdminDashboardPage() {
  const { isAdmin, user, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  const getTierBadgeVariant = (tier: UserTier) => {
    if (tier === 'Premium') return 'default'; 
    if (tier === 'Pro') return 'default'; 
    if (tier === 'Basic') return 'secondary';
    return 'outline';
  };
  
  const getTierBadgeClassName = (tier: UserTier) => {
    if (tier === 'Premium') return 'bg-purple-500 hover:bg-purple-600 text-white';
    if (tier === 'Pro') return 'bg-neon text-background hover:bg-neon/90';
    return '';
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <ShieldAlert className="mr-3 h-8 w-8" /> Admin Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome, Admin {user?.displayName || user?.email}! Manage users and oversee app activity.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-xl text-primary">
            <Users className="mr-2 h-5 w-5" /> User Management (Simulated)
          </CardTitle>
          <CardDescription>
            Overview of registered users and their current subscription tiers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Avatar</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-center hidden sm:table-cell">Tier</TableHead>
                <TableHead className="text-right hidden md:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulatedUsers.map((simUser) => (
                <TableRow key={simUser.id}>
                  <TableCell>
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={simUser.avatar || `https://placehold.co/40x40.png?text=${simUser.email[0].toUpperCase()}`} alt={simUser.displayName || simUser.email} data-ai-hint="avatar placeholder"/>
                      <AvatarFallback>{(simUser.displayName || simUser.email)[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{simUser.displayName || "N/A"}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{simUser.email}</TableCell>
                  <TableCell className="text-center hidden sm:table-cell">
                    <Badge 
                      variant={getTierBadgeVariant(simUser.tier)}
                      className={getTierBadgeClassName(simUser.tier)}
                    >
                      {simUser.tier}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-muted-foreground hidden md:table-cell">
                    {new Date(simUser.joinedDate).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-primary flex items-center"><Settings className="mr-2 h-5 w-5"/>More Admin Features</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Future sections for site statistics, content moderation, or other administrative tasks can be added here.</p>
            <p className="text-xs text-muted-foreground mt-2">Remember: This admin panel is currently using simulated user data for display purposes.</p>
        </CardContent>
      </Card>

    </div>
  );
}
