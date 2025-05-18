
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
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
import { ExternalLink, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  // trending_tags?: string[]; // Removed as not easily available from the chosen API endpoint
}

export function MarketDataTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CoinData | null; direction: 'ascending' | 'descending' }>({ key: 'market_cap', direction: 'descending' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coins, setCoins] = useState<CoinData[]>([]);

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
        // Ensure data is an array before setting
        if (Array.isArray(data)) {
          setCoins(data.map((coin: any) => ({ // Map to our CoinData interface
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
        setCoins([]); // Clear coins on error
      } finally {
        setLoading(false);
      }
    };

    fetchCoinData();
  }, []);

  const sortedCoins = useMemo(() => {
    let sortableItems = [...coins];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!];
        const valB = b[sortConfig.key!];

        if (typeof valA === 'number' && typeof valB === 'number') {
            return sortConfig.direction === 'ascending' ? valA - valB : valB - valA;
        }
        // Fallback for string sorting if needed, though current keys are numbers or already strings like name/symbol
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
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
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
        className="max-w-sm"
      />
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead onClick={() => requestSort('name')} className="cursor-pointer hover:text-neon">
                Name{getSortIndicator('name')}
              </TableHead>
              <TableHead onClick={() => requestSort('current_price')} className="text-right cursor-pointer hover:text-neon">
                Price{getSortIndicator('current_price')}
              </TableHead>
              <TableHead onClick={() => requestSort('price_change_percentage_24h')} className="text-right cursor-pointer hover:text-neon">
                24h %{getSortIndicator('price_change_percentage_24h')}
              </TableHead>
              <TableHead onClick={() => requestSort('total_volume')} className="text-right hidden md:table-cell cursor-pointer hover:text-neon">
                Volume{getSortIndicator('total_volume')}
              </TableHead>
              <TableHead onClick={() => requestSort('market_cap')} className="text-right hidden lg:table-cell cursor-pointer hover:text-neon">
                Market Cap{getSortIndicator('market_cap')}
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCoins.length > 0 ? sortedCoins.map((coin) => (
              <TableRow key={coin.id} className="hover:bg-muted/50">
                <TableCell>
                  {coin.image && <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" data-ai-hint="coin logo crypto" />}
                </TableCell>
                <TableCell>
                  <div className="font-medium">{coin.name} ({coin.symbol.toUpperCase()})</div>
                  {/* Trending tags removed as it's not directly available from this API endpoint */}
                </TableCell>
                <TableCell className="text-right font-mono">${coin.current_price !== null && coin.current_price !== undefined ? coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 0.01 ? 2 : 8 }) : 'N/A'}</TableCell>
                <TableCell className={`text-right font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h !== null && coin.price_change_percentage_24h !== undefined ? coin.price_change_percentage_24h.toFixed(2) + '%' : 'N/A'}
                </TableCell>
                <TableCell className="text-right font-mono hidden md:table-cell">${coin.total_volume !== null && coin.total_volume !== undefined ? coin.total_volume.toLocaleString() : 'N/A'}</TableCell>
                <TableCell className="text-right font-mono hidden lg:table-cell">${coin.market_cap !== null && coin.market_cap !== undefined ? coin.market_cap.toLocaleString() : 'N/A'}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Button variant="ghost" size="icon" title="Add to Watchlist">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Analyze Coin" asChild>
                      {/* This link currently goes to a general analysis page. It could be updated to a specific coin detail page later. */}
                      <a href={`/analysis?coin=${coin.symbol.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground h-24">
                  No coins found matching your search criteria.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

    