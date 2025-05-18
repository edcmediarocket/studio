
"use client";

import { SignalCard } from "@/components/dashboard/signal-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Signal as SignalIcon } from "lucide-react"; // Renamed to avoid conflict
import { useState, useEffect } from 'react';

// Placeholder signal data - in a real app, this would be fetched based on user tier
const allSignals = [
  { coinName: "DogeCoin (DOGE)", signal: "Buy", confidence: 75, timeframe: "1D", riskLevel: "Medium", lastUpdate: "15m ago", details: "Strong bullish sentiment detected on social media, RSI oversold." },
  { coinName: "Shiba Inu (SHIB)", signal: "Hold", confidence: 60, timeframe: "4H", riskLevel: "Medium", lastUpdate: "30m ago", details: "Market consolidating, awaiting breakout confirmation." },
  { coinName: "Pepe (PEPE)", signal: "Sell", confidence: 80, timeframe: "1H", riskLevel: "High", lastUpdate: "5m ago", details: "Potential whale dump incoming, high volatility expected." },
  { coinName: "Bonk (BONK)", signal: "Buy", confidence: 90, timeframe: "1W", riskLevel: "Low", lastUpdate: "2h ago", details: "New exchange listing and strong community backing suggest upward trend." },
  { coinName: "Floki Inu (FLOKI)", signal: "Buy", confidence: 70, timeframe: "4H", riskLevel: "High", lastUpdate: "1h ago", details: "Increased developer activity and upcoming announcement." },
  { coinName: "Memecoin (MEME)", signal: "Hold", confidence: 55, timeframe: "1D", riskLevel: "Medium", lastUpdate: "45m ago", details: "Sideways movement, watch for volume spike." },
];

// Example of how signals might be filtered by tier
const getTieredSignals = (tier: string) => {
  // In a real app, 'tier' would come from user authentication / subscription status
  if (tier === 'Pro') {
    return allSignals; // Pro users get all signals
  } else if (tier === 'Basic') {
    return allSignals.slice(0, 2); // Basic users get top 2 (example)
  }
  return allSignals.slice(0, 1); // Free users get 1 (example)
};

export default function SignalsPage() {
  const [currentUserTier, setCurrentUserTier] = useState('Free'); // Placeholder for user tier
  const [signalsToShow, setSignalsToShow] = useState(getTieredSignals(currentUserTier));

  // Simulate fetching user tier and updating signals
  useEffect(() => {
    // In a real app, fetch user's actual tier. For demo, cycle through tiers:
    // const tiers = ['Free', 'Basic', 'Pro'];
    // const randomTier = tiers[Math.floor(Math.random() * tiers.length)];
    // setCurrentUserTier(randomTier);
    // For now, let's assume it's fetched and set.
  }, []);

  useEffect(() => {
    setSignalsToShow(getTieredSignals(currentUserTier));
  }, [currentUserTier]);

  // Placeholder function to simulate changing user tier for demonstration
  const changeTier = (newTier: string) => {
    setCurrentUserTier(newTier);
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <SignalIcon className="mr-3 h-8 w-8" /> AI Signal Stream
        </h1>
        <p className="text-lg text-muted-foreground">
          Real-time AI-driven buy/sell signals for meme coins. Signals may be limited by your subscription tier.
        </p>
      </div>

      {/* Demo buttons to change tier - remove in production */}
      <div className="flex gap-2 my-4 p-4 border rounded-md bg-card">
        <p className="text-sm text-muted-foreground self-center">Demo: Change Tier</p>
        <button onClick={() => changeTier('Free')} className="p-2 bg-muted rounded hover:bg-primary/20 text-xs">Free</button>
        <button onClick={() => changeTier('Basic')} className="p-2 bg-muted rounded hover:bg-primary/20 text-xs">Basic</button>
        <button onClick={() => changeTier('Pro')} className="p-2 bg-muted rounded hover:bg-primary/20 text-xs">Pro</button>
        <p className="text-sm self-center ml-auto">Current Tier: <span className="font-semibold text-neon">{currentUserTier}</span></p>
      </div>


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Active Signals</CardTitle>
          <CardDescription>
            Displaying {signalsToShow.length} signal(s) based on your <span className="text-neon">{currentUserTier}</span> tier.
            {currentUserTier !== 'Pro' && " Upgrade for more signals."}
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
            <CardTitle className="text-xl text-primary">Understanding Signals</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Our AI analyzes multiple factors including market trends, social sentiment, and on-chain data to generate these signals. </p>
            <p><span className="font-semibold text-foreground">Buy:</span> Indicates a potential upward price movement.</p>
            <p><span className="font-semibold text-foreground">Sell:</span> Indicates a potential downward price movement.</p>
            <p><span className="font-semibold text-foreground">Hold:</span> Suggests current conditions don't strongly favor buying or selling.</p>
            <p className="font-bold">Disclaimer: These are AI-generated signals and not financial advice. Always do your own research (DYOR).</p>
        </CardContent>
      </Card>
    </div>
  );
}
