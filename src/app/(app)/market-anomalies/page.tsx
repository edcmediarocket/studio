
"use client";

import { MarketAnomalyDetector } from "@/components/tools/market-anomaly-detector";
import { Siren } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function MarketAnomaliesPage() {
  const { currentTier } = useTier();

  const isLocked = currentTier !== "Premium" && currentTier !== "Pro";
  
  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <Siren className="mr-3 h-8 w-8" /> AI Market Anomaly Detector
        </h1>
        <p className="text-lg text-muted-foreground">
          Identify unusual market activities and sentiment shifts for various crypto segments, powered by AI.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI Market Anomaly Detector" requiredTier="Premium" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <MarketAnomalyDetector />
      </div>
    </div>
  );
}
