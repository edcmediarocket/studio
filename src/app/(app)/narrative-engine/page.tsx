
"use client";

import { NarrativeEngine } from "@/components/tools/narrative-engine";
import { Lightbulb } from "lucide-react"; // Or MessagesSquare, Brain
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";

export default function NarrativeEnginePage() {
  const { currentTier } = useTier();

  // Premium or Pro can access this feature
  if (currentTier !== "Premium" && currentTier !== "Pro") {
    return <UpgradePrompt featureName="AI Narrative Engine" requiredTier="Premium" />;
  }

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <Lightbulb className="mr-3 h-8 w-8" /> AI Narrative Sentiment Engine
        </h1>
        <p className="text-lg text-muted-foreground">
          Detect emerging market narratives and shifts in psychological sentiment for any crypto topic or coin.
        </p>
      </div>
      <NarrativeEngine />
    </div>
  );
}

