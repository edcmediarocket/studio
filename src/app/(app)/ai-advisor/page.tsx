
"use client";

import { AiChatAssistant } from "@/components/tools/ai-chat-assistant";
import { BotMessageSquare } from "lucide-react";

export default function AiAdvisorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <BotMessageSquare className="mr-3 h-8 w-8" /> AI Advisor
        </h1>
        <p className="text-lg text-muted-foreground">
          Ask questions about specific meme coins or general crypto topics.
        </p>
      </div>
      <AiChatAssistant />
    </div>
  );
}
