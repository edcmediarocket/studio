
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
      setChartError(null); // Clear error as well
      return;
    }

    const fetchChartData = async () => {
      setChartLoading(true);
      setChartError(null);
      setChartData([]); 

      let processedCoinId = selectedCoinForAnalysis.toLowerCase().replace(/\s+/g, '-');
      if (processedCoinId === 'xrp') {
        processedCoinId = 'ripple'; // Map XRP to its CoinGecko ID
      }

      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${processedCoinId}/ohlc?vs_currency=usd&days=30`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Invalid JSON response from server" }));
          const apiErrorMessage = errorData.error || `API error (Status: ${response.status})`;
          
          console.warn(`Chart data fetch failed for ${processedCoinId} (original input: "${selectedCoinForAnalysis}"): ${apiErrorMessage}`);

          if (apiErrorMessage.toLowerCase().includes("coin not found")) {
            setChartError(`Could not load chart for "${selectedCoinForAnalysis}". CoinGecko couldn't find this coin with the ID '${processedCoinId}'. Some common coins use specific IDs (e.g., for XRP, use 'ripple'). Please verify the ID on CoinGecko or try another coin.`);
          } else {
            setChartError(`Could not load chart for "${selectedCoinForAnalysis}": ${apiErrorMessage}. Please ensure the coin ID is correct or try a different coin.`);
          }
          setChartData([]);
        } else {
          const data: [number, number, number, number, number][] = await response.json();
          
          if (data.length === 0) {
            console.warn(`No OHLC data found for ${processedCoinId}.`);
            setChartError(`No chart data available for "${selectedCoinForAnalysis}". The coin might be new or data is not tracked by CoinGecko.`);
            setChartData([]);
          } else {
            setChartData(data.map(item => ({
              timestamp: item[0],
              open: item[1],
              high: item[2],
              low: item[3],
              close: item[4],
            })));
            setChartError(null); // Clear any previous error on success
          }
        }
      } catch (err) { 
        console.error("Unexpected error fetching chart data:", err);
        let message = "An unexpected error occurred while fetching chart data. Please check your connection or try again later.";
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
          Enter a coin name (e.g., Bitcoin, Dogecoin, XRP) to get AI insights and view its price chart.
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
