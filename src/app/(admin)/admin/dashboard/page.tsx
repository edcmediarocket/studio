
"use client";

// Comment out original content for diagnostics
// import dynamic from 'next/dynamic';
// import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Loader2, ShieldAlert } from "lucide-react";

// const AdminGate = dynamic(() => import('@/components/admin/AdminGate'), {
//   ssr: false,
//   loading: () => (
//     <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
//       <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       <p className="ml-3 text-muted-foreground">Loading Admin Panel...</p>
//     </div>
//   ),
// });

export default function AdminDashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-neon">Admin Dashboard Test</h1>
      <p className="text-muted-foreground">If you see this, the basic page route is working.</p>
      <p className="text-muted-foreground mt-4">
        The actual admin components (AdminGate and AdminDashboard) are temporarily commented out for debugging an Internal Server Error.
        Please check your server terminal logs for more details if the error persists.
      </p>
    </div>
  );
}
