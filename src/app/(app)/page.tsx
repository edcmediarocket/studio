
"use client"; 

import { MarketDataTable } from "@/components/dashboard/market-data-table";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, TrendingDown, Info } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Placeholder data for Market Overview
const topGainers = [
  { name: "GainCoin", symbol: "GNR", change: "+35.2%", image: "https://placehold.co/40x40.png" },
  { name: "Rocket Token", symbol: "RKT", change: "+28.1%", image: "https://placehold.co/40x40.png" },
  { name: "MoonShot", symbol: "MSHT", change: "+22.5%", image: "https://placehold.co/40x40.png" },
];

const topLosers = [
  { name: "DropCoin", symbol: "DRP", change: "-18.7%", image: "https://placehold.co/40x40.png" },
  { name: "Anchor Token", symbol: "ANC", change: "-15.3%", image: "https://placehold.co/40x40.png" },
  { name: "EarthBound", symbol: "EBD", change: "-12.0%", image: "https://placehold.co/40x40.png" },
];


export default function DashboardPage() {

  return (
    <div className="space-y-6">
      <section className="py-4 sm:py-6">
        <div className="container px-0 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 text-neon">
            Market Overview
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Today's crypto market at a glance.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-primary">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-400" /> Top Gainers (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {topGainers.map(coin => (
                  <div key={coin.symbol} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <img src={coin.image} alt={coin.name} className="h-6 w-6 mr-2 rounded-full" data-ai-hint="coin logo crypto"/>
                      <span>{coin.name} ({coin.symbol})</span>
                    </div>
                    <span className="text-green-400 font-semibold">{coin.change}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2 italic flex items-center"><Info className="h-3 w-3 mr-1"/>Placeholder data. Real-time gainers coming soon.</p>
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-primary">
                  <TrendingDown className="mr-2 h-5 w-5 text-red-400" /> Top Losers (24h)
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                {topLosers.map(coin => (
                  <div key={coin.symbol} className="flex justify-between items-center">
                     <div className="flex items-center">
                       <img src={coin.image} alt={coin.name} className="h-6 w-6 mr-2 rounded-full" data-ai-hint="coin logo crypto"/>
                       <span>{coin.name} ({coin.symbol})</span>
                    </div>
                    <span className="text-red-400 font-semibold">{coin.change}</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground pt-2 italic flex items-center"><Info className="h-3 w-3 mr-1"/>Placeholder data. Real-time losers coming soon.</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-start items-center mb-6">
             <h2 className="text-xl sm:text-2xl font-semibold text-foreground flex-grow">
                All Coins
             </h2>
            <Button size="default" variant="outline_primary" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm sm:text-base w-full sm:w-auto" asChild>
              <Link href="/account#subscription">
                <Zap className="mr-2 h-4 w-4" /> Upgrade Plan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Card className="shadow-md">
        <CardContent className="p-0 sm:p-2 md:p-4">
          <MarketDataTable />
        </CardContent>
      </Card>
    </div>
  );
}
