
"use client";

import { OnChainDataVisualizer } from "@/components/tools/on-chain-data-visualizer";
import { Activity } from "lucide-react";

export default function OnChainInsightsPage() {
  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <Activity className="mr-3 h-8 w-8" /> On-Chain Insights
        </h1>
        <p className="text-lg text-muted-foreground">
          Get AI-generated textual analysis of typical on-chain characteristics for a meme coin.
        </p>
      </div>
      <OnChainDataVisualizer />
    </div>
  );
}
