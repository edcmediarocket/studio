
"use client";

import { useState, useEffect } from "react";
import { SentimentAnalysisCard } from "@/components/analysis/sentiment-analysis-card";
import { PriceTrendAnalysisCard } from "@/components/analysis/price-trend-analysis-card";
import { WhaleMovementAnalysisCard } from "@/components/analysis/whale-movement-analysis-card";
import { FuturePricePredictionCard } from "@/components/analysis/future-price-prediction-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { BarChartHorizontalBig, Loader2, Search, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AnalysisPage() {
  const [coinInput, setCoinInput] = useState("");
  const [selectedCoinForAnalysis, setSelectedCoinForAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false); 

  const [currentCoinPrice, setCurrentCoinPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (!selectedCoinForAnalysis) {
        setCurrentCoinPrice(null);
        setPriceError(null);
        return;
      }
      setPriceLoading(true);
      setPriceError(null);
      setCurrentCoinPrice(null);

      let coinId = selectedCoinForAnalysis.trim().toLowerCase();
      const coinIdMappings: { [key: string]: string } = {
        "xrp": "ripple",
        "shiba inu": "shiba-inu",
        "dogecoin": "dogecoin",
        "xdc": "xdce-crowd-sale", // Added mapping for XDC
      };
      coinId = coinIdMappings[coinId] || coinId.replace(/\s+/g, '-');

      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
          const apiErrorMessage = errorData?.error || `CoinGecko API error (Status: ${response.status})`;
          if (response.status === 404 || (apiErrorMessage && apiErrorMessage.toLowerCase().includes('could not find coin with id'))) {
            setPriceError(`Could not find current price for "${selectedCoinForAnalysis}". CoinGecko might use a different ID (e.g., 'ripple' for XRP, 'xdce-crowd-sale' for XDC).`);
          } else {
            setPriceError(`Failed to fetch current price: ${apiErrorMessage}.`);
          }
          setCurrentCoinPrice(null);
        } else {
          const data = await response.json();
          if (data[coinId] && data[coinId].usd !== undefined) {
            setCurrentCoinPrice(data[coinId].usd);
            setPriceError(null);
          } else {
            setPriceError(`Current price data not available for "${selectedCoinForAnalysis}" from CoinGecko using ID '${coinId}'. AI predictions needing price may be affected.`);
            setCurrentCoinPrice(null);
          }
        }
      } catch (err) {
        console.warn("Error fetching current price for analysis page:", err);
         if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
          setPriceError(`Network error: Failed to fetch price for "${selectedCoinForAnalysis}". Please check your internet connection. AI predictions needing price may be affected.`);
        } else if (err instanceof Error) {
          setPriceError(`An unexpected error occurred while fetching the price for "${selectedCoinForAnalysis}": ${err.message}. AI predictions needing price may be affected.`);
        } else {
           setPriceError(`An unexpected error occurred while fetching the price for "${selectedCoinForAnalysis}". AI predictions needing price may be affected.`);
        }
        setCurrentCoinPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };

    if (selectedCoinForAnalysis) {
      fetchCurrentPrice();
    }
  }, [selectedCoinForAnalysis]);


  const handleCoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoadingAnalysis(true); 
    if (coinInput.trim()) {
      setSelectedCoinForAnalysis(coinInput.trim());
    } else {
      setSelectedCoinForAnalysis(null);
      setCurrentCoinPrice(null);
      setPriceError(null);
    }
    // Simulate some delay or let useEffect in cards handle their own loading
    setTimeout(() => setIsLoadingAnalysis(false), 500); 
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
                placeholder="Enter coin name or ID (e.g. bitcoin, dogecoin, xdc)"
                value={coinInput}
                onChange={(e) => setCoinInput(e.target.value)}
                className="text-base"
              />
            </div>
            <Button type="submit" disabled={isLoadingAnalysis || !coinInput.trim()} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
              {isLoadingAnalysis ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Analyze Coin
            </Button>
          </form>
          {priceLoading && selectedCoinForAnalysis && (
            <div className="mt-3 flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching current price for {selectedCoinForAnalysis}...
            </div>
          )}
          {priceError && selectedCoinForAnalysis && (
            <Alert variant="destructive" className="mt-3 text-xs py-2 px-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{priceError} AI predictions needing price may be affected.</AlertDescription>
            </Alert>
          )}
          {currentCoinPrice !== null && selectedCoinForAnalysis && !priceError && (
            <div className="mt-3 text-sm text-muted-foreground">
              Current price for <span className="font-semibold text-foreground">{selectedCoinForAnalysis}</span>: 
              <span className="font-bold text-neon ml-1">${currentCoinPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentCoinPrice > 0.01 ? 2 : 8 })}</span>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        <SentimentAnalysisCard coinName={selectedCoinForAnalysis} />
        <PriceTrendAnalysisCard coinName={selectedCoinForAnalysis} />
        <WhaleMovementAnalysisCard coinName={selectedCoinForAnalysis} />
        <FuturePricePredictionCard 
          coinName={selectedCoinForAnalysis} 
          currentCoinPrice={currentCoinPrice} 
          priceLoading={priceLoading}
        />
      </div>
    </div>
  );
}
