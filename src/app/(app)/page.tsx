
"use client"; 

import { MarketDataTable } from "@/components/dashboard/market-data-table";
import { Button } from "@/components/ui/button";
import { Zap, Signal as SignalIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DashboardPage() {

  return (
    <div className="space-y-6">
      <section className="py-4 sm:py-6 rounded-lg bg-gradient-to-br from-primary/10 via-background to-background ">
        <div className="container px-0 sm:px-4">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-center sm:text-left">
            Welcome to <span className="text-neon">Meme Prophet</span>
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-4 text-center sm:text-left">
            Your AI-powered crystal ball for the meme coin universe.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
            <Button size="default" className="bg-neon text-background hover:bg-neon/90 text-sm sm:text-base" asChild>
              <Link href="/signals">
                <SignalIcon className="mr-2 h-4 w-4" /> View AI Signals
              </Link>
            </Button>
            <Button size="default" variant="outline_primary" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-sm sm:text-base" asChild>
              <Link href="/account#subscription"> {/* Assuming tools are now top-level or in account/settings */}
                <Zap className="mr-2 h-4 w-4" /> Upgrade Plan
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">Live Market Data</CardTitle>
          <CardDescription className="text-sm sm:text-base">Click on a coin for detailed insights.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 md:p-4"> {/* Adjust padding for the card content */}
          <MarketDataTable />
        </CardContent>
      </Card>
    </div>
  );
}
