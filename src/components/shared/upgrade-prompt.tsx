
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Zap } from "lucide-react";

interface UpgradePromptProps {
  featureName: string;
  requiredTier?: "Pro" | "Basic"; // Or more specific if needed
}

export function UpgradePrompt({ featureName, requiredTier = "Pro" }: UpgradePromptProps) {
  return (
    <Card className="w-full max-w-lg mx-auto my-8 shadow-xl border-neon">
      <CardHeader className="text-center">
        <Rocket className="h-16 w-16 text-neon mx-auto mb-4" />
        <CardTitle className="text-2xl sm:text-3xl text-neon">
          Unlock {featureName} with {requiredTier} Tier!
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
