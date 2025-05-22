
"use client";

import AdminGate from "@/components/admin/AdminGate"; // Corrected path
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

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
