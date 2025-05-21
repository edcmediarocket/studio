
"use client";

import React from 'react'; // Import React
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Zap } from "lucide-react";
import type { UserTier } from "@/context/tier-context"; // Import UserTier

interface UpgradePromptProps {
  featureName: string;
  requiredTier?: UserTier | string; // Allow string for "Pro or Premium" etc.
}

const UpgradePromptComponent: React.FC<UpgradePromptProps> = ({ featureName, requiredTier = "Pro" }) => {
  return (
    <Card className="w-full max-w-lg mx-auto my-8 shadow-xl border-neon">
      <CardHeader className="text-center">
        <Rocket className="h-16 w-16 text-neon mx-auto mb-4" />
        <CardTitle className="text-2xl sm:text-3xl text-neon">
          Unlock {featureName} with {requiredTier}!
        </CardTitle>
        <CardDescription className="text-base sm:text-lg text-muted-foreground mt-2">
          This advanced feature is available for our {requiredTier} subscribers.
          Upgrade your plan to gain access and supercharge your meme coin analysis.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button size="lg" asChild className="bg-neon text-background hover:bg-neon/90 text-lg">
          <Link href="/account#subscription">
            <Zap className="mr-2 h-5 w-5" /> View Subscription Plans
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export const UpgradePrompt = React.memo(UpgradePromptComponent);
