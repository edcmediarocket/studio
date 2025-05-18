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
import { ArrowUpDown, ExternalLink, PlusCircle, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface CoinData {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h: number;
  trending_tags?: string[];
}

// Placeholder data - replace with API call to CoinGecko or similar
const placeholderCoins: CoinData[] = [
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png?1547792256', current_price: 0.15, market_cap: 20000000000, total_volume: 1000000000, price_change_percentage_24h: 2.5, trending_tags: ['Meme', 'Top 10'] },
  { id: 'shiba-inu', name: 'Shiba Inu', symbol: 'SHIB', image: 'https://assets.coingecko.com/coins/images/11939/small/shiba.png?1622619446', current_price: 0.000025, market_cap: 15000000000, total_volume: 800000000, price_change_percentage_24h: -1.2, trending_tags: ['Meme', 'Ethereum Ecosystem'] },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', image: 'https://assets.coingecko.com/coins/images/29850/small/Time_to_get_frogy_with_it_mien.jpeg?1682322348', current_price: 0.0000015, market_cap: 700000000, total_volume: 200000000, price_change_percentage_24h: 5.8, trending_tags: ['New', 'Meme'] },
  { id: 'bonk', name: 'Bonk', symbol: 'BONK', image: 'https://assets.coingecko.com/coins/images/28600/small/bonk.jpg?1672220842', current_price: 0.00003, market_cap: 1200000000, total_volume: 300000000, price_change_percentage_24h: -0.5, trending_tags: ['Solana Ecosystem', 'Meme'] },
];

export function MarketDataTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CoinData | null; direction: 'ascending' | 'descending' }>({ key: 'market_cap', direction: 'descending' });
  const [loading, setLoading] = useState(true);
  const [coins, setCoins] = useState<CoinData[]>([]);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setCoins(placeholderCoins);
      setLoading(false);
    }, 1500);
  }, []);

  const sortedCoins = useMemo(() => {
    let sortableItems = [...coins];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key!] < b[sortConfig.key!]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key!] > b[sortConfig.key!]) {
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
      return sortConfig.direction === 'ascending' ? '▲' : '▼';
    }
    return '';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search coins..."
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
                Name {getSortIndicator('name')}
              </TableHead>
              <TableHead onClick={() => requestSort('current_price')} className="text-right cursor-pointer hover:text-neon">
                Price {getSortIndicator('current_price')}
              </TableHead>
              <TableHead onClick={() => requestSort('price_change_percentage_24h')} className="text-right cursor-pointer hover:text-neon">
                24h % {getSortIndicator('price_change_percentage_24h')}
              </TableHead>
              <TableHead onClick={() => requestSort('total_volume')} className="text-right hidden md:table-cell cursor-pointer hover:text-neon">
                Volume {getSortIndicator('total_volume')}
              </TableHead>
              <TableHead onClick={() => requestSort('market_cap')} className="text-right hidden lg:table-cell cursor-pointer hover:text-neon">
                Market Cap {getSortIndicator('market_cap')}
              </TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedCoins.map((coin) => (
              <TableRow key={coin.id} className="hover:bg-muted/50">
                <TableCell>
                  <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" data-ai-hint="coin logo crypto" />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{coin.name} ({coin.symbol.toUpperCase()})</div>
                  {coin.trending_tags && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {coin.trending_tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 0.01 ? 2 : 8 })}</TableCell>
                <TableCell className={`text-right font-mono ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </TableCell>
                <TableCell className="text-right font-mono hidden md:table-cell">${coin.total_volume.toLocaleString()}</TableCell>
                <TableCell className="text-right font-mono hidden lg:table-cell">${coin.market_cap.toLocaleString()}</TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <Button variant="ghost" size="icon" title="Add to Watchlist">
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Analyze Coin" asChild>
                      <a href={`/analysis?coin=${coin.symbol.toLowerCase()}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
