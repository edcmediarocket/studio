
"use client";

import { SmartAlertSetup } from "@/components/tools/smart-alert-setup";
import { BellPlus } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function SmartAlertsPage() {
  const { currentTier } = useTier();

  const isLocked = currentTier !== "Premium"; // Example: Premium only feature

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <BellPlus className="mr-3 h-8 w-8" /> AI Smart Alert Setup
        </h1>
        <p className="text-lg text-muted-foreground">
          Define custom alert conditions and get AI-powered insights on your scenarios. (Alerts are simulated).
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI Smart Alert Setup" requiredTier="Premium" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <SmartAlertSetup />
      </div>
    </div>
  );
}
