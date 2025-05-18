
"use client";

import { AiChatAssistant } from "@/components/tools/ai-chat-assistant";
import { BotMessageSquare } from "lucide-react";
import { useTier } from "@/context/tier-context";
import { UpgradePrompt } from "@/components/shared/upgrade-prompt";
import { cn } from "@/lib/utils";

export default function AiAdvisorPage() {
  const { currentTier } = useTier();

  const isLocked = currentTier !== "Pro" && currentTier !== "Premium";

  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <BotMessageSquare className="mr-3 h-8 w-8" /> AI Advisor
        </h1>
        <p className="text-lg text-muted-foreground">
          Ask questions about specific meme coins or general crypto topics.
        </p>
      </div>

      {isLocked && <UpgradePrompt featureName="AI Advisor" requiredTier="Pro" />}
      
      <div className={cn(isLocked && "blur-sm opacity-60 pointer-events-none")}>
        <AiChatAssistant />
      </div>
    </div>
  );
}
