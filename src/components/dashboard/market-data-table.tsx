
"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { Button } from "@/components/ui/button";
import { Star, LineChart } from "lucide-react";
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string | null;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
}

const FAVORITES_STORAGE_KEY = "rocketMemeWatchlistFavorites_v1"; // Added a version to avoid conflicts

interface MarketDataTableProps {
  searchTerm: string;
}

interface MarketDataRowProps {
  coin: CoinData;
  isFavorited: boolean;
  onToggleFavorite: (coinId: string) => void;
}

const MarketDataRow: React.FC<MarketDataRowProps> = React.memo(({ coin, isFavorited, onToggleFavorite }) => {
  return (
    <TableRow key={coin.id} className="hover:bg-muted/50">
      <TableCell className="pr-0 py-3 px-2 sm:px-4">
        {coin.image && typeof coin.image === 'string' && coin.image.trim() !== '' ? (
            <Link href={`/coin/${coin.id}`} className="block">
                <Image src={coin.image} alt={coin.name} width={28} height={28} className="rounded-full" data-ai-hint="coin logo crypto" />
            </Link>
        ) : (
          <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-xs">
            {coin.symbol ? coin.symbol[0].toUpperCase() : '?'}
          </div>
        )}
      </TableCell>
      <TableCell className="py-3 px-2 sm:px-4">
        <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors">
          <div className="font-medium text-sm sm:text-base">{coin.name}</div>
          <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
        </Link>
      </TableCell>
      <TableCell className="text-right font-mono py-3 px-2 sm:px-4 text-sm sm:text-base">
        <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
            ${coin.current_price !== null && coin.current_price !== undefined ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 0.01 ? 2 : 8 }) : 'N/A'}
        </Link>
      </TableCell>
      <TableCell className={cn("text-right font-mono py-3 px-2 sm:px-4 text-sm sm:text-base", coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400')}>
        <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
            {coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined ? coin.price_change_percentage_24h.toFixed(2) + '%' : 'N/A'}
        </Link>
      </TableCell>
      <TableCell className="text-right font-mono hidden md:table-cell py-3 px-2 sm:px-4 text-sm sm:text-base">
         <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
            ${coin.market_cap !== null && coin.market_cap !== undefined ? coin.market_cap.toLocaleString() : 'N/A'}
         </Link>
        </TableCell>
      <TableCell className="text-center py-3 px-2 sm:px-4">
        <div className="flex items-center justify-center space-x-0 sm:space-x-1">
          <Button
            variant="ghost"
            size="icon"
            title={isFavorited ? "Remove from Watchlist" : "Add to Watchlist"}
            className="h-7 w-7 sm:h-9 sm:w-9"
            onClick={() => onToggleFavorite(coin.id)}
          >
            <Star className={cn("h-4 w-4 sm:h-5 sm:w-5", isFavorited ? "text-primary fill-primary" : "text-muted-foreground")} />
          </Button>
          <Button variant="ghost" size="icon" title="View Details" asChild className="h-7 w-7 sm:h-9 sm:w-9">
            <Link href={`/coin/${coin.id}`}>
              <LineChart className="h-4 w-4 sm:h-5 sm:w-5" />
            </Link>
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});
MarketDataRow.displayName = 'MarketDataRow';

export function MarketDataTable({ searchTerm }: MarketDataTableProps) {
  const [sortConfig, setSortConfig] = useState<{ key: keyof CoinData | null; direction: 'ascending' | 'descending' }>({ key: 'market_cap', direction: 'descending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [favoritedCoins, setFavoritedCoins] = useState(new Set<string>());
  const [initialFavoritesLoaded, setInitialFavoritesLoaded] = useState(false);

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
    setInitialFavoritesLoaded(true); // Mark initial load as complete
  }, []); // Empty dependency array: runs once on mount

  // Save favorites to localStorage whenever favoritedCoins changes, AFTER initial load
  useEffect(() => {
    if (initialFavoritesLoaded) { // Only save after initial load from localStorage
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(Array.from(favoritedCoins)));
      } catch (e) {
        console.error("Failed to save favorites to localStorage", e);
      }
    }
  }, [favoritedCoins, initialFavoritesLoaded]); // Depend on favoritedCoins and the loaded flag


  useEffect(() => {
    const fetchCoinData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false');
        if (!response.ok) {
           const errorData = await response.json().catch(() => ({}));
           let errorMessage = errorData.error || `Failed to fetch coin data: ${response.statusText}`;
           if (response.status === 429) {
             errorMessage = "API rate limit exceeded. Please wait a moment and try again.";
           } else if (!navigator.onLine || errorMessage.toLowerCase().includes('failed to fetch')) {
             errorMessage = "Network error: Could not fetch coin data. Please check your internet connection and try refreshing.";
           }
           throw new Error(errorMessage);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCoins(data.map((coin: any) => ({
            id: coin.id,
            name: coin.name,
            symbol: coin.symbol,
            image: coin.image || null,
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
        let specificError = "An unknown error occurred while fetching coin data.";
        if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
          specificError = "Network error: Could not fetch coin data. Please check your internet connection and try refreshing.";
        } else if (err instanceof Error) {
          specificError = err.message;
        }
        setError(specificError);
        setCoins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, []);

  const toggleFavorite = useCallback((coinId: string) => {
    setFavoritedCoins(prevFavorites => {
      const newFavorites = new Set(prevFavorites);
      if (newFavorites.has(coinId)) {
        newFavorites.delete(coinId);
      } else {
        newFavorites.add(coinId);
      }
      return newFavorites;
    });
  }, []);

  const filteredAndSortedCoins = useMemo(() => {
    let itemsToDisplay = [...coins];
    const lowerSearchTerm = searchTerm.toLowerCase().trim();

    if (lowerSearchTerm === 'trending') {
      itemsToDisplay = itemsToDisplay
        .filter(coin => coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 10); 
      return itemsToDisplay;
    } else if (lowerSearchTerm === 'ai picks') {
      const aiPickIds = ['bitcoin', 'ethereum', 'dogecoin', 'pepe', 'shiba-inu', 'bonk', 'dogwifhat'];
      itemsToDisplay = itemsToDisplay.filter(coin => aiPickIds.includes(coin.id));
    } else if (lowerSearchTerm) {
      itemsToDisplay = itemsToDisplay.filter(coin =>
        (coin.name && coin.name.toLowerCase().includes(lowerSearchTerm)) ||
        (coin.symbol && coin.symbol.toLowerCase().includes(lowerSearchTerm))
      );
    }
    

    if (sortConfig.key !== null) {
      itemsToDisplay.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (valA === null || valA === undefined) return 1;
        if (valB === null || valB === undefined) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        if (String(valA).toLowerCase() < String(valB).toLowerCase()) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (String(valA).toLowerCase() > String(valB).toLowerCase()) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    } else { 
      itemsToDisplay.sort((a, b) => (b.market_cap || 0) - (a.market_cap || 0));
    }

    return itemsToDisplay;
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
        <div className="border rounded-md">
            {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border-b last:border-b-0">
                <Skeleton className="h-7 w-7 rounded-full" />
                <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-1/4 hidden md:table-cell" />
                <Skeleton className="h-4 w-1/6" /> 
                <Skeleton className="h-8 w-16" /> 
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
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const renderNoResultsMessage = () => {
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    if (lowerSearchTerm === 'trending') {
      return "No actively trending coins found in the top 100 right now.";
    }
    if (lowerSearchTerm === 'ai picks') {
      return "None of the current 'AI Picks' are in the top 100 market data, or data is still loading.";
    }
    if (searchTerm) {
      return "No coins found matching your search criteria.";
    }
    return "No coins available to display. Data might be loading or an error occurred.";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px] sm:w-[50px] pr-0 py-3 px-2 sm:px-4"></TableHead>
          <TableHead onClick={() => requestSort('name')} className="cursor-pointer text-xs sm:text-sm px-2 sm:px-4 py-3">
            Name{getSortIndicator('name')}
          </TableHead>
          <TableHead onClick={() => requestSort('current_price')} className="text-right cursor-pointer text-xs sm:text-sm px-2 sm:px-4 py-3">
            Price{getSortIndicator('current_price')}
          </TableHead>
          <TableHead onClick={() => requestSort('price_change_percentage_24h')} className="text-right cursor-pointer text-xs sm:text-sm px-2 sm:px-4 py-3">
            24h %{getSortIndicator('price_change_percentage_24h')}
          </TableHead>
          <TableHead onClick={() => requestSort('market_cap')} className="text-right hidden md:table-cell cursor-pointer text-xs sm:text-sm px-2 sm:px-4 py-3">
            Market Cap{getSortIndicator('market_cap')}
          </TableHead>
          <TableHead className="text-center text-xs sm:text-sm px-2 sm:px-4 py-3">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredAndSortedCoins.length > 0 ? filteredAndSortedCoins.map((coin) => (
          <MarketDataRow
            key={coin.id}
            coin={coin}
            isFavorited={favoritedCoins.has(coin.id)}
            onToggleFavorite={toggleFavorite}
          />
        )) : (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground h-24">
              {renderNoResultsMessage()}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

