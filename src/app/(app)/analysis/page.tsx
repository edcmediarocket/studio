
"use client";

import { useState, useEffect } from "react";
import { SentimentAnalysisCard } from "@/components/analysis/sentiment-analysis-card";
import { PriceTrendAnalysisCard } from "@/components/analysis/price-trend-analysis-card";
import { WhaleMovementAnalysisCard } from "@/components/analysis/whale-movement-analysis-card";
import { CoinPriceChart } from "@/components/analysis/coin-price-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChartHorizontalBig, Loader2, Search } from "lucide-react";
import type { OhlcData } from "@/components/analysis/coin-price-chart"; // Import type for chart data

export default function AnalysisPage() {
  const [coinInput, setCoinInput] = useState(""); // For the input field
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState<string | null>(null);
  const [chartData, setChartData] = useState<OhlcData[]>([]);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState<string | null>(null);

  const handleCoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (coinInput.trim()) {
      setSelectedCoinForAnalysis(coinInput.trim());
    }
  };

  useEffect(() => {
    if (!selectedCoinForAnalysis) {
      setChartData([]); // Clear chart if no coin is selected
      return;
    }

    const fetchChartData = async () => {
      setChartLoading(true);
      setChartError(null);
      setChartData([]); // Clear previous data

      // Attempt to format coin name as a potential CoinGecko ID
      const coinId = selectedCoinForAnalysis.toLowerCase().replace(/\s+/g, '-');

      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=30`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch chart data for ${selectedCoinForAnalysis}. Status: ${response.status}`);
        }
        const data: [number, number, number, number, number][] = await response.json();
        
        if (data.length === 0) {
          throw new Error(`No OHLC data found for ${selectedCoinForAnalysis}. The coin ID might be incorrect or it's not listed on CoinGecko with that ID.`);
        }

        setChartData(data.map(item => ({
          timestamp: item[0],
          open: item[1],
          high: item[2],
          low: item[3],
          close: item[4],
        })));
      } catch (err) {
        console.error(err);
        let message = "An unknown error occurred while fetching chart data.";
        if (err instanceof Error) {
          message = err.message;
        }
        setChartError(message);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedCoinForAnalysis]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <BarChartHorizontalBig className="mr-3 h-8 w-8" /> AI Analysis Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Enter a coin name (e.g., Bitcoin, Dogecoin) to get AI insights and view its price chart.
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
                placeholder="Enter coin name or ID (e.g. bitcoin, dogecoin)"
                value={coinInput}
                onChange={(e) => setCoinInput(e.target.value)}
                className="text-base"
              />
            </div>
            <Button type="submit" disabled={chartLoading || !coinInput.trim()} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {chartLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Get Data & Analyze
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {selectedCoinForAnalysis && (
        <CoinPriceChart 
          coinName={selectedCoinForAnalysis} 
          data={chartData} 
          loading={chartLoading} 
          error={chartError} 
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SentimentAnalysisCard coinName={selectedCoinForAnalysis} />
        <PriceTrendAnalysisCard coinName={selectedCoinForAnalysis} />
        <WhaleMovementAnalysisCard coinName={selectedCoinForAnalysis} />
      </div>
    </div>
  );
}
