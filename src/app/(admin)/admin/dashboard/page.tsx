
"use client";

import dynamic from 'next/dynamic';
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, ShieldAlert } from "lucide-react";

// Dynamically import AdminGate with SSR turned off
const AdminGate = dynamic(() => import('@/components/admin/AdminGate'), {
  ssr: false,
  loading: () => (
    <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-3 text-muted-foreground">Loading Admin Panel...</p>
    </div>
  ),
});

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8 p-4 md:p-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
            <ShieldAlert className="mr-3 h-8 w-8" /> Admin Panel
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Oversee users and manage application settings. Access is restricted.
          </CardDescription>
        </CardHeader>
      </Card>
      <AdminGate />
    </div>
  );
}
