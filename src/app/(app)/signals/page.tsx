
"use client";

import { SignalCard } from "@/components/dashboard/signal-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button"; // Import Button
import { Signal as SignalIcon, Zap } from "lucide-react"; // Renamed to avoid conflict, Added Zap
import { useState, useEffect } from 'react';
import { useTier, type UserTier } from "@/context/tier-context"; // Import useTier and UserTier
import Link from "next/link"; // Import Link

// Placeholder signal data - now with more detailed analysis
const allSignals = [
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
];

const getTieredSignals = (tier: UserTier) => {
  if (tier === 'Pro') {
    return allSignals;
  } else if (tier === 'Basic') {
    return allSignals.slice(0, 3); // Basic users get top 3
  }
  return allSignals.slice(0, 1); // Free users get 1
};

export default function SignalsPage() {
  const { currentTier, setCurrentTier } = useTier(); // Use TierContext
  const [signalsToShow, setSignalsToShow] = useState(getTieredSignals(currentTier));

  useEffect(() => {
    setSignalsToShow(getTieredSignals(currentTier));
  }, [currentTier]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <SignalIcon className="mr-3 h-8 w-8" /> AI Signal Stream
        </h1>
        <p className="text-lg text-muted-foreground">
          Real-time AI-driven buy/sell signals for meme coins, featuring detailed analysis. Signals may be limited by your subscription tier.
        </p>
      </div>

      {/* Demo buttons to change tier - remove in production */}
      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-lg">Demo: Simulate Tier Change</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
            <Button onClick={() => setCurrentTier('Free')} variant={currentTier === 'Free' ? 'default' : 'outline'} size="sm" className="text-xs">Set to Free</Button>
            <Button onClick={() => setCurrentTier('Basic')} variant={currentTier === 'Basic' ? 'default' : 'outline'} size="sm" className="text-xs">Set to Basic</Button>
            <Button onClick={() => setCurrentTier('Pro')} variant={currentTier === 'Pro' ? 'default' : 'outline'} size="sm" className="text-xs">Set to Pro</Button>
            <p className="text-sm self-center ml-auto">Current Tier: <span className="font-semibold text-neon">{currentTier}</span></p>
        </CardContent>
      </Card>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Active Signals & Analysis</CardTitle>
          <CardDescription>
            Displaying {signalsToShow.length} signal(s) with detailed AI analysis based on your <span className="text-neon">{currentTier}</span> tier.
            {currentTier !== 'Pro' && (
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
                <SignalCard key={index} {...signal} />
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
