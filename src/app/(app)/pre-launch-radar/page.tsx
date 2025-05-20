
"use client";

import { PreLaunchRadarDisplay } from "@/components/tools/pre-launch-radar-display";
import { SearchCode } from "lucide-react"; // Using SearchCode icon
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function PreLaunchRadarPage() {
  const { currentTier } = useTier();

  // This feature is typically very high-value, let's make it Premium only for this example
  const isLocked = currentTier !== "Premium"; 

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <SearchCode className="mr-3 h-8 w-8" /> AI Pre-Launch Gem Radar
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover AI-simulated insights into potential pre-launch or very early-stage meme coins and crypto projects. EXTREMELY HIGH RISK.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI Pre-Launch Gem Radar" requiredTier="Premium" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <PreLaunchRadarDisplay />
      </div>
    </div>
  );
}
