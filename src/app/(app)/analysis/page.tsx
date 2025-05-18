
"use client";

import { useState, useEffect } from "react";
import { SentimentAnalysisCard } from "@/components/analysis/sentiment-analysis-card";
import { PriceTrendAnalysisCard } from "@/components/analysis/price-trend-analysis-card";
import { WhaleMovementAnalysisCard } from "@/components/analysis/whale-movement-analysis-card";
import { FuturePricePredictionCard } from "@/components/analysis/future-price-prediction-card"; // Added
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChartHorizontalBig, Loader2, Search } from "lucide-react";

export default function AnalysisPage() {
  const [coinInput, setCoinInput] = useState("");
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // General loading state for analysis submission

  const handleCoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); 
    if (coinInput.trim()) {
      setSelectedCoinForAnalysis(coinInput.trim());
    } else {
      setSelectedCoinForAnalysis(null);
    }
    // Simulate some delay or let useEffect in cards handle their own loading
    setTimeout(() => setIsLoading(false), 500); 
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <BarChartHorizontalBig className="mr-3 h-8 w-8" /> AI Analysis Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Enter a coin name (e.g., Bitcoin, Dogecoin, XRP) to get AI insights.
        </p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Select Coin for Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCoinSubmit} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="w-full sm:flex-grow">
              <Label htmlFor="coinName-analysis-shared" className="sr-only">Coin Name</Label>
              <Input
                id="coinName-analysis-shared"
                type="text"
                placeholder="Enter coin name or ID (e.g. bitcoin, dogecoin, xrp)"
                value={coinInput}
                onChange={(e) => setCoinInput(e.target.value)}
                className="text-base"
              />
            </div>
            <Button type="submit" disabled={isLoading || !coinInput.trim()} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Analyze Coin
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6"> {/* Adjusted grid for 2x2 on XL */}
        <SentimentAnalysisCard coinName={selectedCoinForAnalysis} />
        <PriceTrendAnalysisCard coinName={selectedCoinForAnalysis} />
        <WhaleMovementAnalysisCard coinName={selectedCoinForAnalysis} />
        <FuturePricePredictionCard coinName={selectedCoinForAnalysis} /> {/* Added new card */}
      </div>
    </div>
  );
}
