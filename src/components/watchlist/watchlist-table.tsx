
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
import { Trash2, Bell, BellRing, Edit3, LineChart, AlertTriangle, X, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '../ui/skeleton';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { useToast } from '@/hooks/use-toast';

interface AlertCondition {
  type: 'price_above' | 'price_below' | 'none';
  value: number | null;
}

interface WatchlistItem {
  id: string;
  name: string;
  symbol: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  notes?: string; // Added notes field
  alert_active?: boolean;
  alertCondition?: AlertCondition;
}

const placeholderWatchlistData: WatchlistItem[] = [
  { id: 'dogecoin', name: 'Dogecoin', symbol: 'DOGE', image: 'https://assets.coingecko.com/coins/images/5/small/dogecoin.png?1547792256', current_price: 0.158, price_change_percentage_24h: 3.1, notes: 'Waiting for $0.20, potential Elon tweet soon.', alert_active: true, alertCondition: { type: 'price_above', value: 0.20 } },
  { id: 'pepe', name: 'Pepe', symbol: 'PEPE', image: 'https://assets.coingecko.com/coins/images/29850/small/Time_to_get_frogy_with_it_mien.jpeg?1682322348', current_price: 0.00000155, price_change_percentage_24h: -0.5, notes: 'Monitor for volume increase.', alert_active: false, alertCondition: {type: 'none', value: null} },
];

const WATCHLIST_STORAGE_KEY = "rocketMemeUserWatchlist_v1";


export function WatchlistTable() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const [isNotesDialogOpen, setIsNotesDialogOpen] = useState(false); // State for notes dialog
  const [selectedCoinForOperation, setSelectedCoinForOperation] = useState<WatchlistItem | null>(null);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [priceTarget, setPriceTarget] = useState<string>("");
  const [currentNotes, setCurrentNotes] = useState<string>(""); // State for current notes being edited
  const { toast } = useToast();

  useEffect(() => {
    const storedWatchlist = localStorage.getItem(WATCHLIST_STORAGE_KEY);
    if (storedWatchlist) {
      setWatchlist(JSON.parse(storedWatchlist));
    } else {
      setWatchlist(placeholderWatchlistData); 
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) { 
      localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(watchlist));
    }
  }, [watchlist, loading]);


  const openAlertConfig = (coin: WatchlistItem) => {
    setSelectedCoinForOperation(coin);
    setAlertEnabled(coin.alert_active || false);
    setPriceTarget(coin.alertCondition?.value?.toString() || "");
    setIsAlertDialogOpen(true);
  };
  
  const openNotesDialog = (coin: WatchlistItem) => {
    setSelectedCoinForOperation(coin);
    setCurrentNotes(coin.notes || "");
    setIsNotesDialogOpen(true);
  };

  const handleSaveAlert = () => {
    if (!selectedCoinForOperation) return;

    const targetValue = parseFloat(priceTarget);
    if (alertEnabled && (isNaN(targetValue) || targetValue <= 0)) {
        toast({
            title: "Invalid Price Target",
            description: "Please enter a valid positive number for the price target.",
            variant: "destructive",
        });
        return;
    }

    setWatchlist(prev =>
      prev.map(item =>
        item.id === selectedCoinForOperation.id
          ? { ...item, 
              alert_active: alertEnabled, 
              alertCondition: alertEnabled 
                              ? { type: selectedCoinForOperation.current_price > targetValue ? 'price_below' : 'price_above', value: targetValue } // Simple logic for type
                              : { type: 'none', value: null } 
            }
          : item
      )
    );
    toast({
        title: "Alert Updated",
        description: `Alert settings for ${selectedCoinForOperation.name} have been saved.`,
    });
    setIsAlertDialogOpen(false);
    setSelectedCoinForOperation(null);
  };
  
  const handleRemoveAlert = () => {
     if (!selectedCoinForOperation) return;
     setWatchlist(prev =>
      prev.map(item =>
        item.id === selectedCoinForOperation.id
          ? { ...item, alert_active: false, alertCondition: { type: 'none', value: null } }
          : item
      )
    );
    toast({
        title: "Alert Removed",
        description: `Alert for ${selectedCoinForOperation.name} has been removed.`,
    });
    setIsAlertDialogOpen(false);
    setSelectedCoinForOperation(null);
  };

  const handleSaveNotes = () => {
    if (!selectedCoinForOperation) return;
    setWatchlist(prev => 
      prev.map(item => 
        item.id === selectedCoinForOperation.id 
          ? { ...item, notes: currentNotes.trim() } 
          : item
      )
    );
    toast({
        title: "Notes Saved",
        description: `Notes for ${selectedCoinForOperation.name} have been updated.`,
    });
    setIsNotesDialogOpen(false);
    setSelectedCoinForOperation(null);
  };


  const removeItem = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
    toast({
        title: "Coin Removed",
        description: "Coin successfully removed from your watchlist.",
    });
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
    <>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">My Watchlist</CardTitle>
          <CardDescription>Track your favorite meme coins, set alerts, and add notes. (Alerts are simulated)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                  <TableHead className="text-xs sm:text-sm px-2 sm:px-4">Name</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4">Price</TableHead>
                  <TableHead className="text-right text-xs sm:text-sm px-2 sm:px-4">24h %</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm px-2 sm:px-4">Notes</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm px-2 sm:px-4">Alerts</TableHead>
                  <TableHead className="text-center text-xs sm:text-sm px-2 sm:px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {watchlist.map((coin) => (
                  <TableRow key={coin.id} className="hover:bg-muted/50">
                    <TableCell className="py-3 px-2 sm:px-4">
                      <Link href={`/coin/${coin.id}`}>
                        <Image src={coin.image} alt={coin.name} width={24} height={24} className="rounded-full" data-ai-hint="coin logo crypto"/>
                      </Link>
                    </TableCell>
                    <TableCell className="py-3 px-2 sm:px-4">
                      <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors">
                        <div className="font-medium text-sm sm:text-base">{coin.name}</div>
                        <div className="text-xs text-muted-foreground">{coin.symbol.toUpperCase()}</div>
                      </Link>
                    </TableCell>
                    <TableCell className="text-right font-mono py-3 px-2 sm:px-4 text-sm sm:text-base">
                       <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
                          ${coin.current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: coin.current_price > 0.01 ? 2 : 8 })}
                       </Link>
                    </TableCell>
                    <TableCell className={cn("text-right font-mono py-3 px-2 sm:px-4 text-sm sm:text-base", coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400')}>
                      <Link href={`/coin/${coin.id}`} className="hover:text-neon transition-colors block">
                        {coin.price_change_percentage_24h.toFixed(2)}%
                      </Link>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground py-3 px-2 sm:px-4">
                      {coin.notes ? (
                        <span title={coin.notes} className="truncate block max-w-[150px]">{coin.notes}</span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-center py-3 px-2 sm:px-4">
                      <Button variant="ghost" size="icon" onClick={() => openAlertConfig(coin)} title={coin.alert_active ? "Manage Alert" : "Set Alert"} className="h-7 w-7 sm:h-9 sm:w-9">
                        {coin.alert_active ? <BellRing className="h-4 w-4 sm:h-5 sm:w-5 text-neon fill-neon/30" /> : <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />}
                      </Button>
                    </TableCell>
                    <TableCell className="text-center py-3 px-2 sm:px-4">
                      <div className="flex items-center justify-center space-x-0 sm:space-x-1">
                        <Button variant="ghost" size="icon" title="View Details" asChild className="h-7 w-7 sm:h-9 sm:w-9">
                          <Link href={`/coin/${coin.id}`}>
                            <LineChart className="h-4 w-4 sm:h-5 sm:w-5" />
                          </Link>
                        </Button>
                         <Button variant="ghost" size="icon" title="Edit Notes" onClick={() => openNotesDialog(coin)} className="h-7 w-7 sm:h-9 sm:w-9">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => removeItem(coin.id)} title="Remove from Watchlist" className="text-destructive hover:text-destructive h-7 w-7 sm:h-9 sm:w-9">
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
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

      {/* Alert Configuration Dialog */}
      {selectedCoinForOperation && (
        <Dialog open={isAlertDialogOpen} onOpenChange={(open) => {
            setIsAlertDialogOpen(open);
            if (!open) setSelectedCoinForOperation(null); 
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Configure Alert for {selectedCoinForOperation.name}</DialogTitle>
              <DialogDescription>
                Set up a (simulated) price alert. In a real app, this would notify you.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="alert-enabled"
                  checked={alertEnabled}
                  onCheckedChange={setAlertEnabled}
                />
                <Label htmlFor="alert-enabled" className="text-base">Enable Alert</Label>
              </div>
              {alertEnabled && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price-target" className="text-right col-span-1">
                    Price Target (USD)
                  </Label>
                  <Input
                    id="price-target"
                    type="number"
                    step="any"
                    value={priceTarget}
                    onChange={(e) => setPriceTarget(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., 0.25"
                  />
                </div>
              )}
               {!alertEnabled && (
                   <p className="text-sm text-muted-foreground text-center">Alert is currently disabled for this coin.</p>
               )}
            </div>
            <DialogFooter className="sm:justify-between">
                <Button variant="destructive" onClick={handleRemoveAlert} className="mr-auto sm:mr-0">
                    <Trash2 className="mr-2 h-4 w-4" /> Remove Alert
                </Button>
              <div className="flex gap-2">
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleSaveAlert}>Save Alert</Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Notes Dialog */}
      {selectedCoinForOperation && (
        <Dialog open={isNotesDialogOpen} onOpenChange={(open) => {
          setIsNotesDialogOpen(open);
          if(!open) setSelectedCoinForOperation(null);
        }}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Notes for {selectedCoinForOperation.name}</DialogTitle>
              <DialogDescription>
                Add or edit your personal notes for this coin.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="Type your notes here..."
                value={currentNotes}
                onChange={(e) => setCurrentNotes(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveNotes}>Save Notes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}


    