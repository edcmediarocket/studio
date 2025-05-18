
"use client";

import { SignalCard } from "@/components/dashboard/signal-card";
import type { SignalCardProps } from "@/components/dashboard/signal-card"; // Import the type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; 
import { Signal as SignalIcon, Zap, RefreshCw } from "lucide-react"; 
import { useState, useEffect, useCallback } from 'react';
import { useTier, type UserTier } from "@/context/tier-context"; 
import Link from "next/link"; 

// Master list of all available signals (placeholder data)
const initialSignalsData: SignalCardProps[] = [
  { 
    coinName: "DogeCoin (DOGE)", 
    signal: "Buy", 
    confidence: 75, 
    timeframe: "1D", 
    riskLevel: "Medium", 
    lastUpdate: "15m ago", 
    details: "AI analysis indicates a confluence of positive short-term catalysts: a surge in social media sentiment (Twitter mentions +25%, Reddit positivity +18%), RSI divergence suggesting upward momentum, and increasing whale accumulation observed in the last 24 hours. Potential target $0.175 if current support at $0.15 holds." 
  },
  { 
    coinName: "Shiba Inu (SHIB)", 
    signal: "Hold", 
    confidence: 60, 
    timeframe: "4H", 
    riskLevel: "Medium", 
    lastUpdate: "30m ago", 
    details: "Market currently shows consolidation within a narrow range ($0.000024 - $0.000026). Volume is moderate, and key technical indicators (MACD, Bollinger Bands) are neutral. Awaiting a clear breakout or breakdown signal. Monitor for increased volume as a confirmation for the next move." 
  },
  { 
    coinName: "Pepe (PEPE)", 
    signal: "Sell", 
    confidence: 80, 
    timeframe: "1H", 
    riskLevel: "High", 
    lastUpdate: "5m ago", 
    details: "Strong bearish indicators: on-chain data shows significant token movement to exchanges, potentially indicating profit-taking by large holders. Social sentiment has turned sharply negative (-30% in last 3 hours). High volatility expected. Consider taking profits or tightening stop-losses." 
  },
  { 
    coinName: "Bonk (BONK)", 
    signal: "Buy", 
    confidence: 90, 
    timeframe: "1W", 
    riskLevel: "Low", 
    lastUpdate: "2h ago", 
    details: "Fundamental strength building: recent successful mainnet upgrade, upcoming major exchange listing confirmed for next week, and sustained positive developer activity. Community sentiment is overwhelmingly positive. Long-term accumulation phase appears to be underway." 
  },
  { 
    coinName: "Floki Inu (FLOKI)", 
    signal: "Buy", 
    confidence: 70, 
    timeframe: "4H", 
    riskLevel: "High", 
    lastUpdate: "1h ago", 
    details: "AI notes increased developer activity on GitHub and rumors of an upcoming partnership announcement, leading to a cautious buy signal. Technicals show a potential short-term uptrend forming, but market remains volatile for this token. High risk/reward." 
  },
  { 
    coinName: "Memecoin (MEME)", 
    signal: "Hold", 
    confidence: 55, 
    timeframe: "1D", 
    riskLevel: "Medium", 
    lastUpdate: "45m ago", 
    details: "The coin is currently exhibiting sideways price action with decreasing volume, suggesting indecision in the market. Wait for a clear volume spike and a break above key resistance or below support before making a move. Neutral sentiment across social platforms." 
  },
  {
    coinName: "Book of Meme (BOME)",
    signal: "Buy",
    confidence: 85,
    timeframe: "4H",
    riskLevel: "High",
    lastUpdate: "10m ago",
    details: "AI detects a significant surge in social media mentions and positive sentiment, coupled with increasing buy volume on decentralized exchanges. Technical indicators suggest a potential breakout above a key resistance level. High risk, but potential for short-term gains."
  },
  {
    coinName: "Dogwifhat (WIF)",
    signal: "Sell",
    confidence: 65,
    timeframe: "1D",
    riskLevel: "Medium",
    lastUpdate: "1h ago",
    details: "After a recent strong rally, AI analysis indicates potential profit-taking and consolidation. RSI is overbought, and on-chain data shows some large holders moving tokens to exchanges. A corrective pullback is plausible before any further upside."
  }
];

const getTieredSignals = (tier: UserTier, sourceSignals: SignalCardProps[]): SignalCardProps[] => {
  if (tier === 'Premium' || tier === 'Pro') {
    return sourceSignals; // Pro and Premium users see all available signals
  } else if (tier === 'Basic') {
    return sourceSignals.slice(0, 3); // Basic users get top 3
  }
  return sourceSignals.slice(0, 1); // Free users get 1
};

export default function SignalsPage() {
  const { currentTier, setCurrentTier } = useTier(); 
  const [masterSignalList, setMasterSignalList] = useState<SignalCardProps[]>(initialSignalsData);
  const [signalsToShow, setSignalsToShow] = useState<SignalCardProps[]>([]);

  // Effect to simulate auto-updating signals in the master list
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMasterSignalList(prevMasterList => {
        const newList = prevMasterList.map(signal => ({ ...signal })); // Create a deep enough copy for modification
        if (newList.length === 0) return prevMasterList;

        // Pick a random signal to update
        const randomIndex = Math.floor(Math.random() * newList.length);
        const signalToUpdate = newList[randomIndex];
        
        // Update lastUpdate and confidence
        newList[randomIndex] = {
          ...signalToUpdate,
          lastUpdate: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
          confidence: Math.min(100, Math.max(0, signalToUpdate.confidence + (Math.floor(Math.random() * 11) - 5))), // +/- 0-5
          // Optionally, could even randomly change the signal type for more dynamic simulation
          // signal: ['Buy', 'Sell', 'Hold'][Math.floor(Math.random() * 3)] as "Buy" | "Sell" | "Hold",
        };
        return newList;
      });
    }, 15000); // Update every 15 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []); // Run once on mount to start the simulation

  // Effect to update signalsToShow when tier or masterSignalList changes
  useEffect(() => {
    setSignalsToShow(getTieredSignals(currentTier, masterSignalList));
  }, [currentTier, masterSignalList]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <SignalIcon className="mr-3 h-8 w-8" /> AI Signal Stream
        </h1>
        <p className="text-lg text-muted-foreground">
          Live AI-driven buy/sell signals, auto-updating with the latest analysis.
          Pro & Premium users see all available signals.
        </p>
      </div>

      
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg">Demo: Simulate Tier Change</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => setCurrentTier('Free')} variant={currentTier === 'Free' ? 'default' : 'outline'} size="sm" className="text-xs">Set to Free</Button>
            <Button onClick={() => setCurrentTier('Basic')} variant={currentTier === 'Basic' ? 'default' : 'outline'} size="sm" className="text-xs">Set to Basic</Button>
            <Button onClick={() => setCurrentTier('Pro')} variant={currentTier === 'Pro' ? 'default' : 'outline'} size="sm" className="text-xs">Set to Pro</Button>
            <Button onClick={() => setCurrentTier('Premium')} variant={currentTier === 'Premium' ? 'default' : 'outline'} size="sm" className="text-xs">Set to Premium</Button>
            <p className="text-sm self-center ml-auto">Current Tier: <span className="font-semibold text-neon">{currentTier}</span></p>
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Active Signals & Analysis</CardTitle>
            <RefreshCw className="h-5 w-5 text-muted-foreground" />
          </div>
          <CardDescription>
            Displaying {signalsToShow.length} signal(s) with detailed AI analysis based on your <span className="text-neon">{currentTier}</span> tier. Signals auto-refresh periodically.
            {(currentTier !== 'Pro' && currentTier !== 'Premium') && (
                <Button asChild variant="link" className="px-1 text-neon hover:text-neon/80">
                    <Link href="/account#subscription">
                        Upgrade for more signals and deeper insights <Zap className="ml-1 h-4 w-4" />
                    </Link>
                </Button>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signalsToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {signalsToShow.map((signal, index) => (
                <SignalCard key={`${signal.coinName}-${index}-${signal.lastUpdate}`} {...signal} /> // Ensure key changes on update
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No signals available for your current tier or an error occurred.</p>
          )}
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
            <CardTitle className="text-xl text-primary">Understanding Signals & Analysis</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Our AI analyzes multiple factors including market trends, social sentiment, on-chain data, and technical indicators to generate these signals and their accompanying analysis. </p>
            <p><span className="font-semibold text-foreground">Buy:</span> Indicates a potential upward price movement. The analysis provides context.</p>
            <p><span className="font-semibold text-foreground">Sell:</span> Indicates a potential downward price movement. The analysis provides context.</p>
            <p><span className="font-semibold text-foreground">Hold:</span> Suggests current conditions don't strongly favor buying or selling. The analysis explains why.</p>
            <p className="font-bold">Disclaimer: These are AI-generated signals and analyses, not financial advice. Always do your own research (DYOR).</p>
        </CardContent>
      </Card>
    </div>
  );
}

    

    