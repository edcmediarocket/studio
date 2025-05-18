
"use client";

import { PredictionConfidenceDashboard } from "@/components/tools/prediction-confidence-dashboard";
import { ShieldQuestion } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";

export default function ConfidenceDashboardPage() {
  const { currentTier } = useTier();

  // Premium or Pro can access this feature
  if (currentTier !== "Premium" && currentTier !== "Pro") {
    return <UpgradePrompt featureName="AI Prediction Confidence Dashboard" requiredTier="Premium" />;
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <ShieldQuestion className="mr-3 h-8 w-8" /> AI Prediction Confidence Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Visualize the AI's certainty using simulated radar charts, confidence trends, and prediction drift analysis.
        </p>
      </div>
      <PredictionConfidenceDashboard />
    </div>
  );
}

