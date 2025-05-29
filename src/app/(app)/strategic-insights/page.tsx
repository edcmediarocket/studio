
"use client";

import { StrategicTimingAdvisor } from "@/components/tools/strategic-timing-advisor";
import { PreLaunchRadarDisplay } from "@/components/tools/pre-launch-radar-display";
import { Target, SearchCode } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function StrategicInsightsPage() {
  const { currentTier } = useTier();
  const isLocked = currentTier !== "Premium"; // Example: Premium only feature

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <Target className="mr-3 h-8 w-8" /> AI Strategic Insights
        </h1>
        <p className="text-lg text-muted-foreground">
          Discover AI-driven strategic timing advice and potential early gem discoveries.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI Strategic Insights" requiredTier="Premium" />}
      
      <div className={cn("space-y-10", isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <div>
          <StrategicTimingAdvisor />
        </div>

        <Separator className="my-8 border-primary/30" />

        <div>
            <div className="mb-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-neon mb-1 flex items-center justify-center">
                    <SearchCode className="mr-3 h-7 w-7" /> Early Gem Radar
                </h2>
                <p className="text-md text-muted-foreground">
                    AI-scouted potential pre-launch or very early-stage projects. EXTREMELY HIGH RISK.
                </p>
            </div>
            <PreLaunchRadarDisplay />
        </div>
      </div>
    </div>
  );
}

    