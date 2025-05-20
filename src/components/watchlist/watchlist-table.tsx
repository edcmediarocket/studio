
"use client";

import { useState, useEffect } from 'react';
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
import { Trash2, Bell, BellRing, Edit3, LineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils'; // Import cn

interface WatchlistItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  notes?: string;
  alert_active?: boolean;
}

// Placeholder data
const placeholderWatchlist: WatchlistItem[] = [
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png?1547792256', current_price: 0.158, price_change_percentage_24h: 3.1, notes: 'Waiting for $0.20', alert_active: true },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', image: 'https://assets.coingecko.com/coins/images/29850/small/Time_to_get_frogy_with_it_mien.jpeg?1682322348', current_price: 0.00000155, price_change_percentage_24h: -0.5, alert_active: false },
];

export function WatchlistTable() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading watchlist from local storage or cloud
    setTimeout(() => {
      setWatchlist(placeholderWatchlist);
      setLoading(false);
    }, 1000);
  }, []);

  const toggleAlert = (id: string) => {
    setWatchlist(prev => 
      prev.map(item => item.id === id ? { ...item, alert_active: !item.alert_active } : item)
    );
    // In real app, update local storage/cloud and Firebase Cloud Messaging subscription
  };

  const removeItem = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
    // In real app, update local storage/cloud
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4" />
        </CardHeader>
        <CardContent>
          {[...Array(3)].map((_, i) => (
             <div key={i} className="flex items-center space-x-4 p-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (watchlist.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <CardTitle className="text-2xl">Your Watchlist is Empty</CardTitle>
          <CardDescription>Add coins from the market data table to start tracking them.</CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/">
            <Button>Explore Coins</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">My Watchlist</CardTitle>
        <CardDescription>Track your favorite meme coins and set alerts.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">24h %</TableHead>
                <TableHead className="hidden md:table-cell">Notes</TableHead>
                <TableHead className="text-center">Alerts</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {watchlist.map((coin) => (
                <TableRow key={coin.id} className="hover:bg-muted/50">
                  <TableCell className="py-3">
                    <Link href={`/coin/${coin.id}`}>
                      <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" data-ai-hint="coin logo crypto"/>
                    </Link>
                  </TableCell>
                  <TableCell className="py-3">
                    <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors">
                      <div className="font-medium">{coin.name}</div>
                      <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right font-mono py-3">
                     <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
                        ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 0.01 ? 2 : 8 })}
                     </Link>
                  </TableCell>
                  <TableCell className={cn("text-right font-mono py-3", coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400')}>
                    <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
                      {coin.price_change_percentage_24h.toFixed(2)}%
                    </Link>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground py-3">{coin.notes || 'N/A'}</TableCell>
                  <TableCell className="text-center py-3">
                    <Button variant="ghost" size="icon" onClick={() => toggleAlert(coin.id)} title={coin.alert_active ? "Disable Alert" : "Enable Alert"}>
                      {coin.alert_active ? <BellRing className="h-5 w-5 text-neon fill-neon/30" /> : <Bell className="h-5 w-5 text-muted-foreground" />}
                    </Button>
                  </TableCell>
                  <TableCell className="text-center py-3">
                    <div className="flex items-center justify-center space-x-1">
                      <Button variant="ghost" size="icon" title="View Details" asChild>
                        <Link href={`/coin/${coin.id}`}>
                          <LineChart className="h-4 w-4" />
                        </Link>
                      </Button>
                       <Button variant="ghost" size="icon" title="Edit Notes (coming soon)" disabled>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => removeItem(coin.id)} title="Remove from Watchlist" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
