
"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getWeeklyForecasts, type GetWeeklyForecastsOutput, type WeeklyForecast } from '@/ai/flows/get-weekly-forecasts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertTriangle, TrendingUp, TrendingDown, MinusCircle, CalendarDays, Zap, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert imports
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const AUTO_REFRESH_INTERVAL = 60000; // 60 seconds

export function WeeklyForecastCarousel() {
  const [forecastData, setForecastData] = useState<GetWeeklyForecastsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecasts = useCallback(async (isAutoRefresh = false) => {
    if (!isAutoRefresh) { // Only set loading for manual refresh or initial load
      setIsLoading(true);
    }
    setError(null);
    try {
      const data = await getWeeklyForecasts();
      setForecastData(data);
    } catch (err) {
      console.error("Error fetching weekly forecasts:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
       if (errorMessage.toLowerCase().includes('503') || errorMessage.toLowerCase().includes('overloaded') || errorMessage.toLowerCase().includes('service unavailable')) {
        setError("AI Weekly Forecasts are temporarily unavailable due to high demand. Please try refreshing.");
      } else if (errorMessage.toLowerCase().includes('failed to fetch') || errorMessage.toLowerCase().includes('networkerror')) {
        setError("Network error: Failed to fetch AI Weekly Forecasts. Please check your connection.");
      } else {
        setError("Failed to fetch AI Weekly Forecasts. Please try refreshing.");
      }
    } finally {
      if (!isAutoRefresh) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchForecasts(); // Initial fetch
    const intervalId = setInterval(() => fetchForecasts(true), AUTO_REFRESH_INTERVAL);
    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [fetchForecasts]);

  const getTrendIcon = (trend: WeeklyForecast['trendPrediction']) => {
    switch (trend) {
      case "Strongly Bullish":
      case "Bullish":
        return <TrendingUp className="h-5 w-5 text-green-400" />;
      case "Strongly Bearish":
      case "Bearish":
        return <TrendingDown className="h-5 w-5 text-red-400" />;
      case "Neutral/Consolidating":
        return <MinusCircle className="h-5 w-5 text-yellow-400" />;
      default:
        return <MinusCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getConfidenceBadgeColor = (level: WeeklyForecast['confidenceLevel']) => {
    if (level === 'High') return 'bg-green-500 hover:bg-green-600 text-white';
    if (level === 'Medium') return 'bg-yellow-500 hover:bg-yellow-600 text-black';
    if (level === 'Low') return 'bg-red-500 hover:bg-red-600 text-white';
    return 'bg-muted text-muted-foreground';
  };

  if (isLoading && !forecastData) {
    return (
      <Card className="shadow-lg animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2 mt-1"></div>
        </CardHeader>
        <CardContent className="flex space-x-4 p-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-64 h-48 bg-muted/50 rounded-lg shrink-0 p-3 space-y-2">
                <div className="flex items-center space-x-2">
                    <div className="h-8 w-8 bg-muted rounded-full"></div>
                    <div className="h-4 bg-muted rounded w-20"></div>
                </div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4 ml-auto"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error && !forecastData) { // Only show full error if no data is available
    return (
      <Card className="shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Weekly Forecast Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground">{error}</p>
          <Button onClick={() => fetchForecasts()} variant="destructive" size="sm" className="mt-3">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!forecastData || forecastData.forecasts.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center text-primary">
            <CalendarDays className="mr-2 h-5 w-5" /> Weekly Forecasts
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No AI weekly forecasts available at the moment.</p>
           <Button onClick={() => fetchForecasts()} variant="outline" size="sm" className="mt-3">
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </CardContent>
      </Card>
    );
  }


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center text-primary">
                <Zap className="mr-2 h-5 w-5 text-neon" /> AI Weekly Forecasts
            </CardTitle>
            <Button onClick={() => fetchForecasts()} variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-neon" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin"/> : <RefreshCw className="mr-1.5 h-3 w-3" />}
                {isLoading ? "Refreshing..." : forecastData.generatedAt ? `Updated ${formatDistanceToNow(new Date(forecastData.generatedAt), { addSuffix: true })}` : "Refresh"}
            </Button>
        </div>
        <CardDescription>AI-driven speculative outlooks for the week ahead. Auto-refreshes periodically.</CardDescription>
        {error && ( // Display a less intrusive error if data already exists
          <Alert variant="destructive" className="mt-2 text-xs py-1.5 px-2.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex space-x-4 p-4">
            {forecastData.forecasts.map((forecast, index) => {
              const coinId = forecast.coinName.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link href={`/coin/${coinId}`} key={`${forecast.symbol}-${index}-${forecast.analysisDate}`} className="block">
                  <Card className="w-72 sm:w-80 shrink-0 bg-muted/30 hover:shadow-primary/20 hover:shadow-md transition-shadow flex flex-col h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center space-x-3 mb-2">
                        <Image 
                            src={forecast.coinImage} 
                            alt={forecast.coinName} 
                            width={32} 
                            height={32} 
                            className="rounded-full border border-border"
                            data-ai-hint="coin logo crypto"
                        />
                        <div>
                            <CardTitle className="text-base text-foreground">{forecast.coinName}</CardTitle>
                            <CardDescription className="text-xs text-muted-foreground">{forecast.symbol.toUpperCase()} - {forecast.forecastPeriod}</CardDescription>
                        </div>
                      </div>
                       <div className="flex items-center justify-between">
                         <div className="flex items-center text-sm font-semibold">
                            {getTrendIcon(forecast.trendPrediction)}
                            <span className="ml-1.5">{forecast.trendPrediction}</span>
                        </div>
                        <Badge className={cn("text-xs", getConfidenceBadgeColor(forecast.confidenceLevel))}>{forecast.confidenceLevel} Confidence</Badge>
                       </div>
                    </CardHeader>
                    <CardContent className="text-xs space-y-1.5 pt-1 flex-grow">
                      <div className="mb-2">
                        <span className="font-semibold text-foreground/80">Factors: </span> 
                        <span className="text-muted-foreground leading-relaxed break-words whitespace-normal">
                          {forecast.keyFactors.join(', ') || 'General market conditions.'}
                        </span>
                      </div>
                      {forecast.targetPriceRange && (
                        <p className="text-muted-foreground">
                          <span className="font-semibold text-foreground/80">Target Range: </span>{forecast.targetPriceRange}
                        </p>
                      )}
                      <p className="text-muted-foreground/70 pt-1">
                        <span className="font-semibold">Date: </span>{forecast.analysisDate}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-2 pb-3 mt-auto">
                      <Button variant="link" size="sm" className="p-0 h-auto text-neon hover:text-neon/80 text-xs as-div-button">
                            View {forecast.symbol.toUpperCase()} Details
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-3 pb-4">
         <p className="text-xs text-muted-foreground">{forecastData.disclaimer}</p>
      </CardFooter>
    </Card>
  );
}

// This is a helper class to make the button inside the Link look like a div for styling, but remain semantic.
// We can't directly put a Button inside a Link if the Button itself might render an <a>.
// Using a span with button-like styling is a common workaround.
const asDivButton = {
    className: "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-auto p-0 text-neon hover:text-neon/80 text-xs"
};


