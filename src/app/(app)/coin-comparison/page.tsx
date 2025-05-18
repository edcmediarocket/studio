
"use client";

import { CoinComparisonTool } from "@/components/tools/coin-comparison-tool";
import { GitCompareArrows } from "lucide-react";

export default function CoinComparisonPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <GitCompareArrows className="mr-3 h-8 w-8" /> Coin Comparison
        </h1>
        <p className="text-lg text-muted-foreground">
          Compare key metrics and AI insights for two meme coins.
        </p>
      </div>
      <CoinComparisonTool />
    </div>
  );
}
