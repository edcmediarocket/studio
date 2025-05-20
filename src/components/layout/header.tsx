
"use client"; 

import Link from "next/link";
import { Logo } from "@/components/icons/logo";
import { UserNav } from "@/components/layout/user-nav";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Rocket, Mic, Loader2 } from "lucide-react"; 
import { useState } from 'react'; 
import { useToast } from '@/hooks/use-toast'; 
import { getCoinAdvice, type GetCoinAdviceInput } from '@/ai/flows/get-coin-advice'; 
import { ThemeSwitcher } from "./theme-switcher"; // Added ThemeSwitcher import

export function Header() {
  const { toast } = useToast();
  const [isVoiceAssistantLoading, setIsVoiceAssistantLoading] = useState(false);

  const handleVoiceAssistantClick = async () => {
    const userQuery = window.prompt("Ask Rocket Meme AI (e.g., 'What's the outlook for Dogecoin?', 'Explain market cap'):");

    if (userQuery && userQuery.trim() !== "") {
      setIsVoiceAssistantLoading(true);
      try {
        let coinNameForFlow: string | undefined = undefined;
        const coinQueryMatch = userQuery.match(/^(?:what about|what's the outlook for|tell me about)\s+([\w\s]+)(?:\?|$)/i);
        if (coinQueryMatch && coinQueryMatch[1]) {
          coinNameForFlow = coinQueryMatch[1].trim();
        }

        const adviceInput: GetCoinAdviceInput = {
          coinName: coinNameForFlow || "general crypto",
          question: userQuery,
        };

        const advice = await getCoinAdvice(adviceInput);
        toast({
          title: `AI Response for: "${userQuery}"`,
          description: (
            <div className="space-y-2">
              <p className="font-semibold">Advice: <span className="font-normal">{advice.adviceDetail}</span></p>
              {advice.supportingReasoning && <p><span className="font-semibold">Reasoning:</span> <span className="font-normal">{advice.supportingReasoning}</span></p>}
              {advice.potentialRisks && advice.potentialRisks.length > 0 && (
                <div>
                  <p className="font-semibold">Potential Risks:</p>
                  <ul className="list-disc list-inside pl-4">
                    {advice.potentialRisks.map((risk, i) => <li key={i} className="font-normal">{risk}</li>)}
                  </ul>
                </div>
              )}
              <p className="text-xs italic mt-2">{advice.disclaimer}</p>
            </div>
          ),
          duration: 15000, 
        });
      } catch (error) {
        console.error("Voice assistant AI error:", error);
        toast({
          title: "AI Assistant Error",
          description: "Sorry, I couldn't process your request right now. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsVoiceAssistantLoading(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-7 sm:h-8 w-auto" />
          </Link>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2"> {/* Reduced gap slightly for theme switcher */}
          <ThemeSwitcher /> {/* Added ThemeSwitcher */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleVoiceAssistantClick} 
            disabled={isVoiceAssistantLoading}
            className="text-muted-foreground hover:text-primary"
            title="AI Voice Assistant (Simulated)"
          >
            {isVoiceAssistantLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
          </Button>
          <Button asChild variant="outline" className="hidden sm:flex border-neon text-neon hover:bg-neon hover:text-primary-foreground">
            <Link href="/account#subscription">
              <Rocket className="mr-2 h-4 w-4" />
              Go Pro
            </Link>
          </Button>
          <UserNav />
        </div>
      </div>
    </header>
  );
}
