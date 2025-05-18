"use client"; // This page contains client components

import { SignalCard } from "@/components/dashboard/signal-card";
import { MarketDataTable } from "@/components/dashboard/market-data-table";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";

export default function DashboardPage() {
  // Placeholder signal data
  const signals = [
    { coinName: "DogeCoin (DOGE)", signal: "Buy", confidence: 75, timeframe: "1D", riskLevel: "Medium", lastUpdate: "15m ago", details: "Strong bullish sentiment detected on social media, RSI oversold." },
    { coinName: "Shiba Inu (SHIB)", signal: "Hold", confidence: 60, timeframe: "4H", riskLevel: "Medium", lastUpdate: "30m ago", details: "Market consolidating, awaiting breakout confirmation." },
    { coinName: "Pepe (PEPE)", signal: "Sell", confidence: 80, timeframe: "1H", riskLevel: "High", lastUpdate: "5m ago", details: "Potential whale dump incoming, high volatility expected." },
    { coinName: "Bonk (BONK)", signal: "Buy", confidence: 90, timeframe: "1W", riskLevel: "Low", lastUpdate: "2h ago", details: "New exchange listing and strong community backing suggest upward trend." },
  ];

  return (
    <div className="space-y-8">
      <section className="text-center py-8 rounded-lg bg-gradient-to-br from-primary/20 via-background to-background shadow-inner">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-neon">Meme Prophet</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Your AI-powered crystal ball for the meme coin universe.
        </p>
        <Button size="lg" className="bg-neon text-background hover:bg-neon/90">
          <Zap className="mr-2 h-5 w-5" /> Get Started
        </Button>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">AI Signals</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
          {signals.map((signal, index) => (
            <SignalCard key={index} {...signal} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">Live Market Data</h2>
        <MarketDataTable />
      </section>
    </div>
  );
}
