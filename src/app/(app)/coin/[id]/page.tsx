
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function CoinDetailPagePlaceholder() {
  return (
    <div className="p-4 md:p-6">
      <Button variant="outline" asChild className="mb-4">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>
      <div className="flex flex-col items-center justify-center text-center py-10 bg-card rounded-lg shadow-lg">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-bold text-destructive">Coin Detail Page - Diagnostic Mode</h1>
        <p className="text-muted-foreground mt-2 max-w-md">
          This page has been temporarily simplified to help diagnose an Internal Server Error.
        </p>
        <p className="text-muted-foreground mt-2">
          If you can see this message, it suggests the error might be related to the complex data fetching
          or AI analysis components previously on this page.
        </p>
        <p className="font-semibold mt-4">
          Please check your server-side logs (the terminal where `npm run dev` is running) for more specific error messages.
        </p>
      </div>
    </div>
  );
}
