
"use client";

import { MarketAnomalyDetector } from "@/components/tools/market-anomaly-detector";
import { Siren } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";

export default function MarketAnomaliesPage() {
  const { currentTier } = useTier();

  // Premium or Pro can access this feature
  if (currentTier !== "Premium" && currentTier !== "Pro") {
    return <UpgradePrompt featureName="AI Market Anomaly Detector" requiredTier="Premium" />;
  }
  
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
      <MarketAnomalyDetector />
    </div>
  );
}

