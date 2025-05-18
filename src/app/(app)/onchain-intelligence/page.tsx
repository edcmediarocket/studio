
"use client";

import { OnChainIntelligenceScorer } from "@/components/tools/onchain-intelligence-scorer";
import { DatabaseZap } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function OnChainIntelligencePage() {
  const { currentTier } = useTier();

  const isLocked = currentTier !== "Premium" && currentTier !== "Pro";

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <DatabaseZap className="mr-3 h-8 w-8" /> AI On-Chain Intelligence Scoring
        </h1>
        <p className="text-lg text-muted-foreground">
          Get a proprietary AI-driven score (0-100) for any coin, reflecting smart money activity vs. retail FOMO.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI On-Chain Intelligence Scoring" requiredTier="Premium" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <OnChainIntelligenceScorer />
      </div>
    </div>
  );
}
