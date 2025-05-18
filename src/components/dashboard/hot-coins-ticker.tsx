
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Flame, AlertTriangle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingCoinItem {
  id: string;
  coin_id: number;
  name: string;
  symbol: string;
  market_cap_rank: number;
  thumb: string;
  small: string;
  large: string;
  slug: string;
  price_btc: number;
  score: number;
}

interface TrendingCoin {
  item: TrendingCoinItem;
}

interface TrendingApiResponse {
  coins: TrendingCoin[];
  nfts: any[]; // Not used for this ticker
  categories: any[]; // Not used for this ticker
}

export function HotCoinsTicker() {
  const [trendingCoins, setTrendingCoins] = useState<TrendingCoinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingCoins = async () => {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/search/trending');
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch trending coins: ${response.statusText}`);
      }
      const data: TrendingApiResponse = await response.json();

      if (data && Array.isArray(data.coins)) {
        const newCoins = data.coins
          .map((c: any) => c.item)
          .filter(
            (item: any): item is TrendingCoinItem => // Type guard
              item &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.symbol === 'string' &&
              typeof item.thumb === 'string'
          )
          .slice(0, 7);

        if (newCoins.length > 0) {
          setTrendingCoins(newCoins);
          setError(null);
        } else {
          setTrendingCoins([]);
          // If API returned coins, but none passed validation
          if (data.coins.length > 0 && newCoins.length === 0) {
            setError("Trending coins data from API is currently in an unexpected format.");
          } else {
            // API returned no coins or valid structure but empty
            setError(null); // Or "No trending coins found" - for now, null to show "No trending coins" message
          }
        }
      } else {
        console.warn("Trending coins API response is not in the expected format:", data);
        throw new Error("Unexpected data format from trending coins API.");
      }
    } catch (err) {
      console.error("Error fetching trending coins:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching trending coins.");
      }
      // Keep existing coins if fetch fails, to avoid empty ticker unless it's the first load or persistent error
      if (trendingCoins.length === 0) { // Only clear to empty if it's the initial load and it fails
        setTrendingCoins([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingCoins(); // Fetch on initial mount
    const intervalId = setInterval(fetchTrendingCoins, 30000); // Refetch every 30 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // trendingCoins is not needed in deps here as we manage its update inside fetchTrendingCoins

  if (loading && trendingCoins.length === 0) {
    return (
      <div className="h-16 flex items-center justify-center bg-card border-y border-primary/50 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading Hot Coins...
      </div>
    );
  }

  if (error && trendingCoins.length === 0) { // Show error only if there are no coins to display from a previous successful fetch
    return (
      <div className="h-16 flex items-center justify-center bg-destructive/20 border-y border-destructive text-destructive-foreground px-4 text-center">
        <AlertTriangle className="mr-2 h-5 w-5 shrink-0" /> 
        <p className="text-sm">Could not load trending coins: {error}</p>
      </div>
    );
  }

  if (trendingCoins.length === 0 && !loading && !error) { // Added !error condition here
     return (
       <div className="h-16 flex items-center justify-center bg-card border-y border-primary/50 text-muted-foreground">
        No trending coins to display at the moment.
      </div>
    );
  }
  
  // Duplicate coins for seamless scrolling effect, only if there are coins
  const duplicatedCoins = trendingCoins.length > 0 ? [...trendingCoins, ...trendingCoins] : [];

  if (duplicatedCoins.length === 0) { // Handles case where error exists but we still have old coins to show
    if (error) { // If there's an error and we decided not to show the main error message (because old coins are present)
         return (
          <div className="h-16 flex items-center justify-center bg-card border-y border-primary/50 text-muted-foreground px-4 text-center">
            <AlertTriangle className="mr-2 h-5 w-5 text-yellow-500 shrink-0" />
            <p className="text-sm">Trending coins update failed: {error}. Displaying last known data.</p>
            {/* Fallback to render nothing or a static message if this case implies no display */}
          </div>
        );
    }
    return ( // Should be caught by earlier "No trending coins" if error is null
       <div className="h-16 flex items-center justify-center bg-card border-y border-primary/50 text-muted-foreground">
        Preparing ticker...
      </div>
    );
  }


  return (
    <div className="relative w-full h-16 bg-card border-y border-primary/50 overflow-hidden group">
      <div className="absolute inset-0 flex items-center">
        <div className="animate-scroll-horizontal group-hover:pause-animation flex">
          {duplicatedCoins.map((coin, index) => (
            <Link href={`/coin/${coin.id}`} key={`${coin.id}-${index}-${Math.random()}`} className="flex items-center mx-4 p-2 rounded-lg hover:bg-primary/10 transition-colors shrink-0 w-64">
              <Image 
                src={coin.thumb} 
                alt={coin.name} 
                width={24} 
                height={24} 
                className="rounded-full mr-3" 
                data-ai-hint="coin logo crypto"
              />
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold text-foreground truncate" title={`${coin.name} (${coin.symbol.toUpperCase()})`}>{coin.name} ({coin.symbol.toUpperCase()})</span>
                <span className="text-xs text-muted-foreground">Rank: #{coin.market_cap_rank || 'N/A'}</span>
              </div>
               <Flame className="ml-auto h-5 w-5 text-neon opacity-70 flex-shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

