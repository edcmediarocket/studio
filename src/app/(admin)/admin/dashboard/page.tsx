
"use client";

import { useAdminAuth } from '@/hooks/use-admin-auth';
import { Loader2, ShieldAlert, UserCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { UserTier } from '@/context/tier-context';

// Simulated user data structure for the simpler dashboard
interface SimulatedUser {
  id: string;
  email: string;
  tier: UserTier;
}

const simulatedUsers: SimulatedUser[] = [
  { id: '1', email: 'user1@example.com', tier: 'Free' },
  { id: '2', email: 'user2@example.com', tier: 'Basic' },
  { id: '3', email: 'pro_user@example.com', tier: 'Pro' },
  { id: '4', email: 'premium_user@example.com', tier: 'Premium' },
  { id: 'coreyenglish517@gmail.com', email: 'coreyenglish517@gmail.com', tier: 'Premium' },
];

const getTierBadgeClassName = (tier: UserTier) => {
  switch (tier) {
    case 'Free':
      return 'bg-muted text-muted-foreground border-border';
    case 'Basic':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    case 'Pro':
      return 'bg-neon text-background border-neon/50'; 
    case 'Premium':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
    default:
      return 'bg-secondary text-secondary-foreground border-border';
  }
};


export default function AdminDashboardPage() {
  const { isAdmin, user, loading: adminAuthLoading } = useAdminAuth();

  // This loading state handles the async nature of checking auth.
  if (adminAuthLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Verifying admin access...</p>
      </div>
    );
  }

  if (!user) {
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
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
      </div>
    );
  }

  // If isAdmin is true, render the admin dashboard content
  return (
    <div className="p-4 md:p-6 space-y-6">
      <h1 className="text-3xl font-bold text-neon flex items-center">
        <UserCircle className="mr-3 h-8 w-8" /> Admin Dashboard (Simulated)
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>User Overview</CardTitle>
          <CardDescription>This is a simulated list of users and their tiers.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tier
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {simulatedUsers.map((simUser) => (
                  <tr key={simUser.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {simUser.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge className={getTierBadgeClassName(simUser.tier)}>
                        {simUser.tier}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
       <p className="text-xs text-muted-foreground text-center">
        This is a basic admin view. Real user management would involve direct Firestore interaction.
      </p>
    </div>
  );
}
