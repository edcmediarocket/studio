
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Star, LineChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

const FAVORITES_STORAGE_KEY = "rocketMemeWatchlistFavorites";

export function MarketDataTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CoinData | null; direction: 'ascending' | 'descending' }>({ key: 'market_cap', direction: 'descending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [favoritedCoins, setFavoritedCoins] = useState(new Set<string>());

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const storedFavorites = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavorites) {
        setFavoritedCoins(new Set(JSON.parse(storedFavorites)));
      }
    } catch (e) {
      console.error("Failed to load favorites from localStorage", e);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoritedCoins)));
    } catch (e) {
      console.error("Failed to save favorites to localStorage", e);
    }
  }, [favoritedCoins]);


  useEffect(() => {
    const fetchCoinData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        if (!response.ok) {
          throw new Error(`Failed to fetch coin data: ${response.statusText}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCoins(data.map((coin: any) => ({ 
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image,
            current_price: coin.current_price,
            market_cap: coin.market_cap,
            total_volume: coin.total_volume,
            price_change_percentage_24h: coin.price_change_percentage_24h,
          })));
        } else {
          throw new Error('Fetched data is not in the expected format (array)');
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching coin data.");
        }
        setCoins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, []);

  const toggleFavorite = (coinId: string) => {
    setFavoritedCoins(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(coinId)) {
        newFavorites.delete(coinId);
      } else {
        newFavorites.add(coinId);
      }
      return newFavorites;
    });
  };

  const sortedCoins = useMemo(() => {
    let sortableItems = [...coins];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (String(valA) < String(valB)) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (String(valA) > String(valB)) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(coin =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coins, searchTerm, sortConfig]);

  const requestSort = (key: keyof CoinData) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof CoinData) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <div className="border rounded-md">
            {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-1/4" />
            </div>
            ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error Fetching Coin Data</AlertTitle>
        <AlertDescription>{error} Please try refreshing the page later.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search coins (e.g., Bitcoin, ETH)..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-sm text-base sm:text-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px] pr-0"></TableHead>
            <TableHead onClick={() => requestSort('name')} className="cursor-pointer text-xs sm:text-sm">
              Name{getSortIndicator('name')}
            </TableHead>
            <TableHead onClick={() => requestSort('current_price')} className="text-right cursor-pointer text-xs sm:text-sm">
              Price{getSortIndicator('current_price')}
            </TableHead>
            <TableHead onClick={() => requestSort('price_change_percentage_24h')} className="text-right cursor-pointer text-xs sm:text-sm">
              24h %{getSortIndicator('price_change_percentage_24h')}
            </TableHead>
            <TableHead onClick={() => requestSort('market_cap')} className="text-right hidden md:table-cell cursor-pointer text-xs sm:text-sm">
              Market Cap{getSortIndicator('market_cap')}
            </TableHead>
            <TableHead className="text-center text-xs sm:text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCoins.length > 0 ? sortedCoins.map((coin) => (
            <TableRow key={coin.id} className="hover:bg-muted/30">
              <TableCell className="pr-0 py-3">
                {coin.image && (
                    <Link href={`/coin/${coin.id}`} className="block">
                        <Image src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full" data-ai-hint="coin logo crypto" />
                    </Link>
                )}
              </TableCell>
              <TableCell className="py-3">
                <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors">
                  <div className="font-medium text-sm sm:text-base">{coin.name}</div>
                  <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono text-sm sm:text-base py-3">
                <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
                    ${coin.current_price !== null && coin.current_price !== undefined ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 0.01 ? 2 : 8 }) : 'N/A'}
                </Link>
              </TableCell>
              <TableCell className={cn("text-right font-mono text-sm sm:text-base py-3", coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400')}>
                <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
                    {coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined ? coin.price_change_percentage_24h.toFixed(2) + '%' : 'N/A'}
                </Link>
              </TableCell>
              <TableCell className="text-right font-mono hidden md:table-cell text-sm sm:text-base py-3">
                 <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
                    ${coin.market_cap !== null && coin.market_cap !== undefined ? coin.market_cap.toLocaleString() : 'N/A'}
                 </Link>
                </TableCell>
              <TableCell className="text-center py-3">
                <div className="flex items-center justify-center space-x-0 sm:space-x-1">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    title={favoritedCoins.has(coin.id) ? "Remove from Watchlist" : "Add to Watchlist"} 
                    className="h-8 w-8 sm:h-9 sm:w-9"
                    onClick={() => toggleFavorite(coin.id)}
                  >
                    <Star className={cn("h-4 w-4 sm:h-5 sm:w-5", favoritedCoins.has(coin.id) ? "text-primary fill-primary" : "text-muted-foreground")} />
                  </Button>
                  <Button variant="ghost" size="icon" title="View Details" asChild className="h-8 w-8 sm:h-9 sm:w-9">
                    <Link href={`/coin/${coin.id}`}>
                      <LineChart className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
                No coins found matching your search criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}

