
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MarketDataTable } from "@/components/dashboard/market-data-table";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, TrendingUp, TrendingDown, Info, Flame, Loader2, AlertTriangle, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; 
import { HotCoinsTicker } from "@/components/dashboard/hot-coins-ticker";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSignalOfTheDay, type GetSignalOfTheDayOutput } from '@/ai/flows/get-signal-of-the-day';
import { SignalOfTheDayCard } from '@/components/dashboard/signal-of-the-day-card';

interface MarketMoverItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
  change: number;
}

export default function DashboardPage() {
  const [topGainers, setTopGainers] = useState<MarketMoverItem[]>([]);
  const [topLosers, setTopLosers] = useState<MarketMoverItem[]>([]);
  const [isLoadingMovers, setIsLoadingMovers] = useState(true);
  const [moversError, setMoversError] = useState<string | null>(null);

  const [signalOfTheDay, setSignalOfTheDay] = useState<GetSignalOfTheDayOutput | null>(null);
  const [signalOfTheDayLoading, setSignalOfTheDayLoading] = useState(true);
  const [signalOfTheDayError, setSignalOfTheDayError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(''); 

  const fetchSignalOfTheDay = useCallback(async () => {
    setSignalOfTheDayLoading(true);
    setSignalOfTheDayError(null);
    try {
      const signal = await getSignalOfTheDay();
      setSignalOfTheDay(signal);
    } catch (err) {
      console.error("Error fetching signal of the day:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      if (errorMessage.toLowerCase().includes('503') || errorMessage.toLowerCase().includes('overloaded') || errorMessage.toLowerCase().includes('service unavailable')) {
        setSignalOfTheDayError("AI Signal of the Day is temporarily unavailable due to high demand. Please try refreshing in a moment.");
      } else if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('networkerror')) {
        setSignalOfTheDayError("Network error: Failed to fetch AI Signal of the Day. Please check your connection.");
      } else {
        setSignalOfTheDayError("Failed to fetch AI Signal of the Day. Please try again.");
      }
    } finally {
      setSignalOfTheDayLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSignalOfTheDay();
  }, [fetchSignalOfTheDay]);


  useEffect(() => {
    const fetchMarketMovers = async () => {
      setIsLoadingMovers(true);
      setMoversError(null);
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch market data: ${response.statusText}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          const validCoins = data.filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined);

          const sortedByGain = [...validCoins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
          setTopGainers(sortedByGain.slice(0, 3).map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            change: coin.price_change_percentage_24h,
          })));

          const sortedByLoss = [...validCoins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
          setTopLosers(sortedByLoss.slice(0, 3).map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol.toUpperCase(),
            image: coin.image,
            change: coin.price_change_percentage_24h,
          })));
        } else {
          throw new Error("Unexpected data format from API.");
        }
      } catch (err) {
        console.error("Error fetching market movers:", err);
        if (err instanceof Error) {
          setMoversError(err.message);
        } else {
          setMoversError("An unknown error occurred while fetching market movers.");
        }
        setTopGainers([]);
        setTopLosers([]);
      } finally {
        setIsLoadingMovers(false);
      }
    };

    fetchMarketMovers();
  }, []);

  const renderMarketMoverCardContent = (items: MarketMoverItem[], type: 'gainer' | 'loser') => {
    if (isLoadingMovers) {
      return (
        <div className="space-y-3 px-6 py-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <Skeleton className="h-6 w-6 rounded-full" />
              <div className='flex-grow'>
                <Skeleton className="h-4 w-2/3" />
              </div>
              <Skeleton className="h-4 w-1/4" />
            </div>
          ))}
        </div>
      );
    }

    if (items.length === 0 && !moversError) {
        return <p className="text-xs text-muted-foreground px-6 py-2">No significant {type}s found in the top 100 right now.</p>;
    }

    return items.map(coin => (
      <Link href={`/coin/${coin.id}`} key={coin.id} className="block hover:bg-muted/30 transition-colors px-6 py-2 border-b last:border-b-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" data-ai-hint="coin logo crypto"/>
            <div>
              <span className="text-sm font-medium">{coin.name}</span>
              <span className="text-xs text-muted-foreground ml-1.5">{coin.symbol}</span>
            </div>
          </div>
          <span className={`text-sm font-semibold ${type === 'gainer' ? 'text-green-400' : 'text-red-400'}`}>
            {coin.change.toFixed(2)}%
          </span>
        </div>
      </Link>
    ));
  };


  return (
    <div className="space-y-6">
      <section className="py-4 sm:py-6">
        <div className="container px-0 sm:px-4">
          <div className="mb-6">
            <SignalOfTheDayCard
              signalData={signalOfTheDay}
              loading={signalOfTheDayLoading}
              error={signalOfTheDayError}
              onRefresh={fetchSignalOfTheDay}
            />
          </div>

          <HotCoinsTicker />

          <h1 className="text-2xl sm:text-3xl font-bold mt-6 mb-1 text-neon">
            Market Overview
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4">
            Today's crypto market highlights.
          </p>

          {moversError && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>Could not load market movers: {moversError}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-primary">
                  <TrendingUp className="mr-2 h-5 w-5 text-green-400" /> Top Gainers (24h - Top 100)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {renderMarketMoverCardContent(topGainers, 'gainer')}
              </CardContent>
            </Card>
            <Card className="shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center text-primary">
                  <TrendingDown className="mr-2 h-5 w-5 text-red-400" /> Top Losers (24h - Top 100)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {renderMarketMoverCardContent(topLosers, 'loser')}
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center mb-4"> 
             <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                All Coins
             </h2>
             <div className="relative w-full sm:w-auto sm:max-w-xs md:max-w-sm"> 
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search coins..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 text-sm bg-muted border-primary/30 hover:border-primary/70 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-lg shadow-sm placeholder:text-muted-foreground/70"
                />
              </div>
          </div>
        </div>
      </section>

      <Card className="shadow-md">
        <CardContent className="p-0 sm:p-2 md:p-4">
          <MarketDataTable searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </div>
  );
}

