
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getStrategicCoinTiming, type StrategicCoinTimingOutput, type StrategicCoinTimingInput } from "@/ai/flows/get-strategic-coin-timing";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Target, Sparkles, AlertTriangle, Info, Clock, BarChart, DollarSign, MessageSquare, Zap, Globe, TrendingUpIcon, TrendingDownIcon } from "lucide-react"; // Added Globe and other icons
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

export function StrategicTimingAdvisor() {
  const [coinName, setCoinName] = useState("");
  const [timingAdvice, setTimingAdvice] = useState<StrategicCoinTimingOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentCoinPrice, setCurrentCoinPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPrice = async () => {
      if (!coinName.trim()) {
        setCurrentCoinPrice(null);
        setPriceError(null);
        return;
      }
      setPriceLoading(true);
      setPriceError(null);
      setCurrentCoinPrice(null);

      let coinId = coinName.trim().toLowerCase();
      const coinIdMappings: { [key: string]: string } = {
        "xrp": "ripple", "shiba inu": "shiba-inu", "dogecoin": "dogecoin", "xdc": "xdce-crowd-sale",
      };
      coinId = coinIdMappings[coinId] || coinId.replace(/\s+/g, '-');

      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
          const apiErrorMessage = errorData?.error || `CoinGecko API error (Status: ${response.status})`;
          setPriceError(`Price fetch failed for ${coinName}: ${apiErrorMessage}. AI advice will be general.`);
        } else {
          const data = await response.json();
          if (data[coinId] && data[coinId].usd !== undefined) {
            setCurrentCoinPrice(data[coinId].usd);
          } else {
            setPriceError(`Current price not available for "${coinName}" from CoinGecko. AI advice will be general.`);
          }
        }
      } catch (err) {
        setPriceError(`Network error fetching price for "${coinName}". AI advice will be general.`);
      } finally {
        setPriceLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      if (coinName.trim()) {
        fetchPrice();
      } else {
        setCurrentCoinPrice(null);
        setPriceError(null);
        setPriceLoading(false);
      }
    }, 500); // Debounce API call

    return () => clearTimeout(debounceTimer);
  }, [coinName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) {
      setError("Please enter a coin name to get strategic timing advice.");
      setTimingAdvice(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setTimingAdvice(null);
    try {
      const input: StrategicCoinTimingInput = {
        coinName: coinName.trim(),
        currentPriceUSD: currentCoinPrice !== null ? currentCoinPrice : undefined,
      };
      const result = await getStrategicCoinTiming(input);
      setTimingAdvice(result);
    } catch (err: any) {
      console.error("Error getting strategic timing advice:", err);
      let errorMsg = "Failed to get timing advice. The AI might be contemplating the sands of time, please try again.";
      if (err.message && (err.message.toLowerCase().includes('failed to fetch') || err.message.toLowerCase().includes('networkerror'))) {
        errorMsg = "Network error: Could not fetch AI timing advice. Please check your connection.";
      } else if (err.message && (err.message.toLowerCase().includes('503') || err.message.toLowerCase().includes('overloaded'))) {
        errorMsg = "AI service for timing advice is temporarily overloaded. Please try again later.";
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceBadgeVariant = (confidence: 'High' | 'Medium' | 'Low' | undefined) => {
    if (confidence === 'High') return 'default';
    if (confidence === 'Medium') return 'secondary';
    if (confidence === 'Low') return 'destructive';
    return 'outline';
  };

  const getActionBadgeVariant = (action: StrategicCoinTimingOutput['predictedAction'] | undefined) => {
    if (!action) return 'outline';
    if (action.toLowerCase().includes('buy')) return 'default';
    if (action.toLowerCase().includes('sell') || action.toLowerCase().includes('exit')) return 'destructive';
    if (action.toLowerCase().includes('monitor') || action.toLowerCase().includes('observe')) return 'secondary';
    return 'outline';
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <Clock className="mr-2 h-5 w-5" /> AI Strategic Coin Timing
        </CardTitle>
        <CardDescription>
          Enter a coin name for AI-powered insights on potentially opportune buy/sell windows, considering current live prices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="timing-coinName">Coin Name</Label>
            <Input
              id="timing-coinName"
              type="text"
              placeholder="e.g., Bitcoin, Ethereum, Dogecoin"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading || priceLoading}
              className="mt-1"
            />
          </div>
           {priceLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching current price for {coinName.trim()}...
            </div>
          )}
          {priceError && !priceLoading && (
            <Alert variant="destructive" className="text-xs py-2 px-3">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{priceError}</AlertDescription>
            </Alert>
          )}
          {currentCoinPrice !== null && !priceLoading && !priceError && (
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <Label className="text-xs text-muted-foreground">Current Market Price for {coinName.trim()}:</Label>
                <p className="text-xl font-bold text-neon flex items-center">
                  <DollarSign className="h-5 w-5 mr-1"/>
                  {currentCoinPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentCoinPrice < 0.01 && currentCoinPrice !== 0 ? 8 : 2 })}
                </p>
              </CardContent>
            </Card>
          )}

          <Button type="submit" disabled={isLoading || priceLoading || !coinName.trim()} className="w-full bg-primary hover:bg-primary/90">
            {isLoading || priceLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Get Timing Advice
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Timing Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {timingAdvice && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-lg font-semibold text-neon">
                Strategic Timing Insight for: {timingAdvice.coinName.toUpperCase()}
              </h3>
            </div>
            
            <div className="flex flex-col items-center space-y-2 text-center p-4 bg-muted/30 rounded-lg">
              <Badge variant={getActionBadgeVariant(timingAdvice.predictedAction)} className="text-md px-3 py-1 font-semibold">
                {timingAdvice.predictedAction}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Timing Window: <span className="font-medium text-foreground">{timingAdvice.timingWindowEstimate}</span>
              </p>
              <div className="text-xs">
                AI Confidence: 
                <Badge variant={getConfidenceBadgeVariant(timingAdvice.confidence)} className="ml-1.5 text-xs px-2 py-0.5">
                  {timingAdvice.confidence}
                </Badge>
              </div>
            </div>

            <InfoBlock icon={<MessageSquare className="h-5 w-5"/>} title="Key Reasoning">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{timingAdvice.keyReasoning}</p>
            </InfoBlock>

            <InfoBlock icon={<Zap className="h-5 w-5"/>} title="Strategy Notes">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{timingAdvice.strategyNotes}</p>
            </InfoBlock>

            {timingAdvice.detailedSessionTimings && (
              <InfoBlock icon={<Globe className="h-5 w-5"/>} title="Detailed Trading Session Timings">
                <div className="space-y-3">
                  <div>
                    <h5 className="text-sm font-semibold text-primary/90 flex items-center mb-1">
                      <TrendingUpIcon className="h-4 w-4 mr-1.5 text-blue-400"/> U.S. Session:
                    </h5>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap pl-5">{timingAdvice.detailedSessionTimings.usSession}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-primary/90 flex items-center mb-1">
                       <TrendingDownIcon className="h-4 w-4 mr-1.5 text-green-400"/> European Session:
                    </h5>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap pl-5">{timingAdvice.detailedSessionTimings.europeanSession}</p>
                  </div>
                  <div>
                    <h5 className="text-sm font-semibold text-primary/90 flex items-center mb-1">
                        <BarChart className="h-4 w-4 mr-1.5 text-yellow-400"/> Asian Session:
                    </h5>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap pl-5">{timingAdvice.detailedSessionTimings.asianSession}</p>
                  </div>
                </div>
              </InfoBlock>
            )}
            
            {timingAdvice.disclaimer && (
              <Alert variant="default" className="mt-6 border-primary/30 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-muted-foreground text-xs">{timingAdvice.disclaimer}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
         {!isLoading && !timingAdvice && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <Clock className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Enter a coin name above for AI strategic timing advice.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           Strategic timing predictions are AI-simulated and highly speculative. Not financial advice.
         </p>
      </CardFooter>
    </Card>
  );
}

interface InfoBlockProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const InfoBlock: React.FC<InfoBlockProps> = ({icon, title, children}) => (
    <Card className="bg-card shadow-sm">
        <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-md text-primary flex items-center">
                {React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })} 
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

    
