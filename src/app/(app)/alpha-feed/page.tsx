
"use client";

import { AlphaFeedDisplay } from "@/components/feeds/alpha-feed-display";
import { Flame } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function AlphaFeedPage() {
  const { currentTier } = useTier();

  const isLocked = currentTier !== "Premium" && currentTier !== "Pro";

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <Flame className="mr-3 h-8 w-8" /> AI Alpha Feed
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover AI-generated trade ideas based on market conditions, narrative timing, and risk/reward analysis.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI Alpha Feed" requiredTier="Premium" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <AlphaFeedDisplay />
      </div>
    </div>
  );
}
