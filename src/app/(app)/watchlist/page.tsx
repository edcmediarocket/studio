"use client";

import { WatchlistTable } from "@/components/watchlist/watchlist-table";
import { Button } from "@/components/ui/button";
import { Eye, PlusCircle } from "lucide-react";

export default function WatchlistPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
            <Eye className="mr-3 h-8 w-8" /> Coin Watchlist
          </h1>
          <p className="text-lg text-muted-foreground">
            Keep an eye on your favorite meme coins and manage your alerts.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Coin
        </Button>
      </div>
      
      <WatchlistTable />
    </div>
  );
}
