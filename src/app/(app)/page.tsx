
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MarketDataTable } from "@/components/dashboard/market-data-table";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, TrendingUp, TrendingDown, Info, Flame, Loader2, AlertTriangle, RefreshCw, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { HotCoinsTicker } from "@/components/dashboard/hot-coins-ticker";
import { WeeklyForecastCarousel } from "@/components/dashboard/weekly-forecast-carousel";
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getSignalOfTheDay, type GetSignalOfTheDayOutput } from '@/ai/flows/get-signal-of-the-day';
import { SignalOfTheDayCard } from '@/components/dashboard/signal-of-the-day-card';

interface MarketMoverItemProps {
  id: string;
  name: string;
  symbol: string;
  image: string;
  change: number;
  type: 'gainer' | 'loser';
}

const MarketMoverItemCard: React.FC<MarketMoverItemProps> = React.memo(({ id, name, symbol, image, change, type }) => {
  return (
    <Link href={`/coin/${id}`} key={id} className="block hover:bg-muted/30 transition-colors px-3 py-3 sm:px-4 sm:py-2 border-b last:border-b-0">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Image src={image} alt={name} width={24} height={24} className="rounded-full" data-ai-hint="coin logo crypto" />
          <div>
            <span className="text-xs sm:text-sm font-medium">{name}</span>
            <span className="text-xs text-muted-foreground ml-1 sm:ml-1.5">{symbol.toUpperCase()}</span>
          </div>
        </div>
        <span className={`text-xs sm:text-sm font-semibold ${type === 'gainer' ? 'text-green-400' : 'text-red-400'}`}>
          {change.toFixed(2)}%
        </span>
      </div>
    </Link>
  );
});
MarketMoverItemCard.displayName = 'MarketMoverItemCard';


export default function DashboardPage() {
  const [topGainers, setTopGainers] = useState<MarketMoverItemProps[]>([]);
  const [topLosers, setTopLosers] = useState<MarketMoverItemProps[]>([]);
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
           const errorMessage = errorData.error || `Failed to fetch market data: ${response.statusText}`;
          if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('networkerror')) {
             setMoversError("Network error: Could not load market movers. Please check your internet connection and try again.");
          } else {
            setMoversError(errorMessage);
          }
          throw new Error(errorMessage);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          const validCoins = data.filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined);

          const sortedByGain = [...validCoins].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
          setTopGainers(sortedByGain.slice(0, 3).map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            change: coin.price_change_percentage_24h,
            type: 'gainer',
          })));

          const sortedByLoss = [...validCoins].sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h);
          setTopLosers(sortedByLoss.slice(0, 3).map(coin => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            change: coin.price_change_percentage_24h,
            type: 'loser',
          })));
        } else {
          throw new Error("Unexpected data format from API.");
        }
      } catch (err) {
        console.error("Error fetching market movers:", err);
        if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
          setMoversError("Network error: Could not load market movers. Please check your internet connection and try again.");
        } else if (err instanceof Error && !moversError) { // Only set if not already set by network error
          setMoversError(err.message);
        } else if (!moversError) { // Catch all for unknown errors
          setMoversError("An unknown error occurred while fetching market movers.");
        }
        setTopGainers([]);
        setTopLosers([]);
      } finally {
        setIsLoadingMovers(false);
      }
    };

    fetchMarketMovers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderMarketMoverCardContent = (items: MarketMoverItemProps[], type: 'gainer' | 'loser') => {
    if (isLoadingMovers) {
      return (
        <div className="space-y-3 px-3 py-3 sm:px-4 sm:py-2">
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
        return <p className="text-xs text-muted-foreground px-3 py-3 sm:px-4 sm:py-2">No significant {type}s found in the top 100 right now.</p>;
    }
    if (moversError && items.length === 0) return null; 


    return items.map(coin => <MarketMoverItemCard key={coin.id} {...coin} />);
  };


  return (
    <div className="space-y-6 w-full">
      <div className="w-full">
        <SignalOfTheDayCard
          signalData={signalOfTheDay}
          loading={signalOfTheDayLoading}
          error={signalOfTheDayError}
          onRefresh={fetchSignalOfTheDay}
        />
      </div>

      <div className="w-full">
        <HotCoinsTicker />
      </div>

      <div className="w-full">
        <WeeklyForecastCarousel />
      </div>

      <div className="w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-neon mb-1">
          Market Overview
        </h1>
        <p className="text-md sm:text-lg text-muted-foreground mb-4">
            Your Launchpad for Meme Coin Insights.
        </p>
        
        <div className="relative w-full mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search coins or tags (e.g., 'doge', 'trending', 'AI pick')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-11 pl-10 pr-4 text-sm bg-muted border-primary/30 hover:border-primary/70 focus:border-primary focus:ring-1 focus:ring-primary/50 rounded-lg shadow-sm placeholder:text-muted-foreground/70"
          />
        </div>


        {moversError && (
          <Alert variant="destructive" className="mb-6 w-full">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{moversError}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 w-full">
          <Card className="shadow-md w-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center text-primary">
                <TrendingUp className="mr-2 h-5 w-5 text-green-400" /> Top Gainers (24h - Top 100)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {renderMarketMoverCardContent(topGainers, 'gainer')}
            </CardContent>
          </Card>
          <Card className="shadow-md w-full">
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

        <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4">
           All Coins
        </h2>
      </div>

      <Card className="shadow-md w-full">
        <CardContent className="p-0 sm:p-2 md:p-4">
          <MarketDataTable searchTerm={searchTerm} />
        </CardContent>
      </Card>
    </div>
  );
}
