
"use client";

import { CustomSignalGenerator } from "@/components/tools/custom-signal-generator";
import { SlidersHorizontal } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function CustomSignalsPage() {
  const { currentTier } = useTier();

  const isLocked = currentTier !== "Pro" && currentTier !== "Premium";

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <SlidersHorizontal className="mr-3 h-8 w-8" /> Customizable AI Signals
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate tailored AI trading signals by specifying coin, timeframe, and your risk profile.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="Customizable AI Signals" requiredTier="Pro" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <CustomSignalGenerator />
      </div>
    </div>
  );
}
