
"use client";

import { PredictionConfidenceDashboard } from "@/components/tools/prediction-confidence-dashboard";
import { ShieldQuestion } from "lucide-react";

export default function ConfidenceDashboardPage() {
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
