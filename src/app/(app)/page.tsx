
"use client"; // This page contains client components

import { MarketDataTable } from "@/components/dashboard/market-data-table";
import { Button } from "@/components/ui/button";
import { Zap, Signal as SignalIcon } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {

  return (
    <div className="space-y-8">
      <section className="text-center py-8 rounded-lg bg-gradient-to-br from-primary/20 via-background to-background shadow-inner">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Welcome to <span className="text-neon">Meme Prophet</span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-6">
          Your AI-powered crystal ball for the meme coin universe.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-neon text-background hover:bg-neon/90" asChild>
            <Link href="/signals">
              <SignalIcon className="mr-2 h-5 w-5" /> View AI Signals
            </Link>
          </Button>
          <Button size="lg" variant="outline_primary" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground" asChild>
             <Link href="/tools">
              <Zap className="mr-2 h-5 w-5" /> Explore Tools
            </Link>
          </Button>
        </div>
      </section>

      <section>
        <h2 className="text-3xl font-semibold mb-6">Live Market Data</h2>
        <MarketDataTable />
      </section>
    </div>
  );
}
