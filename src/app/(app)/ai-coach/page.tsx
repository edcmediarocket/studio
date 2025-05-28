
"use client";

import { AiCoach } from "@/components/tools/ai-coach";
import { GraduationCap } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function AiCoachPage() {
  const { currentTier } = useTier();

  const isLocked = currentTier !== "Premium"; // Example: Premium only feature

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <GraduationCap className="mr-3 h-8 w-8" /> AI Investment Coach
        </h1>
        <p className="text-lg text-muted-foreground">
          Get advanced investment strategies, buy/sell/hold signals, and detailed reasoning for any meme coin.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI Investment Coach" requiredTier="Premium" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <AiCoach />
      </div>
    </div>
  );
}
