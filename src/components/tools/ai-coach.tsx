
"use client";

import React, { useState, useEffect } from "react";
import { getCoinTradingSignal, type GetCoinTradingSignalOutput } from "@/ai/flows/get-coin-trading-signal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, AlertTriangle, Info, DollarSign, TrendingUp, ShieldCheck, Target, HelpCircle, Briefcase, GraduationCap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Rocket } from "lucide-react"; // For RocketScoreDisplay
import { cn } from "@/lib/utils"; // For cn utility
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { StatItem } from "@/components/shared/stat-item";


const RocketScoreDisplay: React.FC<{ score: number }> = ({ score }) => (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => (
        <Rocket
          key={i}
          className={cn("h-5 w-5", i < score ? "text-neon fill-neon" : "text-muted-foreground/50")}
        />
      ))}
    </div>
  );

const TradingTargetLabel: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <div className="flex items-center">
    <span>{label}</span>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 text-xs p-2">
        {tooltip}
      </PopoverContent>
    </Popover>
  </div>
);


export function AiCoach() {
  const [coinName, setCoinName] = useState("");
  const [coachAdvice, setCoachAdvice] = useState<GetCoinTradingSignalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentCoinPrice, setCurrentCoinPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentPrice = async () => {
      if (!coinName.trim()) {
        setCurrentCoinPrice(null);
        setPriceError(null);
        return;
      }
      setPriceLoading(true);
      setPriceError(null);
      setCurrentCoinPrice(null); // Reset previous price

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
           if (response.status === 404 || (apiErrorMessage && apiErrorMessage.toLowerCase().includes('could not find coin with id'))) {
            setPriceError(`Could not find current price for "${coinName}". CoinGecko might use a different ID (e.g., 'ripple' for XRP). AI advice will be general.`);
          } else {
            setPriceError(`Failed to fetch current price: ${apiErrorMessage}. AI advice will be general.`);
          }
          setCurrentCoinPrice(null);
        } else {
          const data = await response.json();
          if (data[coinId] && data[coinId].usd !== undefined) {
            setCurrentCoinPrice(data[coinId].usd);
          } else {
            setPriceError(`Current price not available for "${coinName}" from CoinGecko using ID '${coinId}'. AI advice will be general.`);
            setCurrentCoinPrice(null);
          }
        }
      } catch (err) {
        console.error("Error fetching current price for AI Coach:", err);
        let specificError = "An unexpected error occurred while fetching price.";
        if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
          specificError = `Network error: Failed to fetch price for "${coinName}". Please check internet connection. AI advice will be general.`;
        } else if (err instanceof Error) {
          specificError = `Error fetching price for "${coinName}": ${err.message}. AI advice will be general.`;
        }
        setPriceError(specificError);
        setCurrentCoinPrice(null);
      } finally {
        setPriceLoading(false);
      }
    };
    
    const debounceTimer = setTimeout(() => {
        if (coinName.trim()) {
            fetchCurrentPrice();
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
      setError("Please enter a coin name to get coaching advice.");
      setCoachAdvice(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setCoachAdvice(null);

    try {
      const result = await getCoinTradingSignal({ 
        coinName: coinName.trim(), 
        currentPriceUSD: currentCoinPrice !== null ? currentCoinPrice : undefined
      });
      setCoachAdvice(result);
    } catch (err) {
      console.error("Error getting AI Coach advice:", err);
      setError("Failed to get coaching advice. The AI Coach might be strategizing, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const getRecommendationBadgeVariant = (recommendation?: 'Buy' | 'Sell' | 'Hold') => {
    if (recommendation === 'Buy') return 'default';
    if (recommendation === 'Sell') return 'destructive';
    if (recommendation === 'Hold') return 'secondary';
    return 'outline';
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <GraduationCap className="mr-2 h-5 w-5" /> Ask the AI Coach
        </CardTitle>
        <CardDescription>
          Enter a coin name to receive advanced investment strategies and signals.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="coach-coinName">Coin Name</Label>
            <Input
              id="coach-coinName"
              type="text"
              placeholder="e.g., Dogecoin, Shiba Inu"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading || priceLoading}
              className="mt-1"
            />
             {priceLoading && (
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Fetching current price for {coinName.trim()}...
                </div>
            )}
            {priceError && !priceLoading && (
                <p className="mt-1 text-xs text-destructive">{priceError}</p>
            )}
            {currentCoinPrice !== null && !priceLoading && !priceError && (
                <p className="mt-1 text-xs text-green-500">Current price for {coinName.trim()}: ${currentCoinPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentCoinPrice > 0.01 ? 2 : 8 })}</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading || priceLoading || !coinName.trim()} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Get AI Coaching
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Coaching Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {coachAdvice && (
          <div className="mt-8 space-y-6">
            <Separator />
            <h3 className="text-xl font-semibold text-neon text-center">
              AI Coach's Strategy for: {coinName.trim().toUpperCase()}
            </h3>
             {currentCoinPrice !== null && (
                <p className="text-xs text-muted-foreground text-center -mt-3">
                    (Analysis based on current price of ${currentCoinPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentCoinPrice > 0.01 ? 2 : 8 })})
                </p>
            )}

            <div className="flex flex-col items-center space-y-2 text-center p-4 bg-muted/30 rounded-lg">
              <Badge variant={getRecommendationBadgeVariant(coachAdvice.recommendation)} className="text-lg px-4 py-1.5 font-semibold">
                {coachAdvice.recommendation}
              </Badge>
              <p className="text-sm text-muted-foreground">{coachAdvice.reasoning}</p>
              <RocketScoreDisplay score={coachAdvice.rocketScore} />
            </div>

            <InfoCard icon={<Info className="h-5 w-5" />} title="Detailed Analysis">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{coachAdvice.detailedAnalysis}</p>
            </InfoCard>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={<TrendingUp className="h-5 w-5" />} title="Future Price Outlook">
                     <StatItem label="Short-Term Target" value={coachAdvice.futurePriceOutlook?.shortTermTarget} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                     <StatItem label="Mid-Term Target" value={coachAdvice.futurePriceOutlook?.midTermTarget} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                </InfoCard>
                <InfoCard icon={<Target className="h-5 w-5" />} title="Suggested Trading Targets">
                    <StatItem label={<TradingTargetLabel label="Entry Point" tooltip="The suggested price or price range at which to consider buying the coin." />} value={coachAdvice.tradingTargets?.entryPoint} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                    <StatItem label={<TradingTargetLabel label="Stop-Loss" tooltip="A pre-set price at which to sell the coin to limit potential losses if the price moves unfavorably." />} value={coachAdvice.tradingTargets.stopLoss} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                    <StatItem label={<TradingTargetLabel label="Take Profit 1" tooltip="First suggested price level at which to consider selling a portion of your holdings to secure profits." />} value={coachAdvice.tradingTargets.takeProfit1} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                    {coachAdvice.tradingTargets.takeProfit2 && <StatItem label={<TradingTargetLabel label="Take Profit 2" tooltip="Second suggested price level for securing further profits." />} value={coachAdvice.tradingTargets.takeProfit2} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>}
                    {coachAdvice.tradingTargets.takeProfit3 && <StatItem label={<TradingTargetLabel label="Take Profit 3" tooltip="Third suggested price level for securing additional profits." />} value={coachAdvice.tradingTargets.takeProfit3} className="px-0 py-1 rounded-b-md" labelClassName="text-xs" valueClassName="text-sm"/>}
                </InfoCard>
            </div>

            <InfoCard icon={<Briefcase className="h-5 w-5" />} title="Investment Advice">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{coachAdvice.investmentAdvice}</p>
            </InfoCard>
            
            {coachAdvice.disclaimer && (
              <p className="text-xs text-muted-foreground pt-4 border-t border-dashed mt-4">{coachAdvice.disclaimer}</p>
            )}
          </div>
        )}
         {!isLoading && !coachAdvice && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Enter a coin name above to get personalized AI coaching.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           AI Coach advice is for informational purposes only and not financial advice. Always DYOR.
         </p>
      </CardFooter>
    </Card>
  );
}

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const InfoCard: React.FC<InfoCardProps> = ({icon, title, children}) => (
    <Card className="bg-card shadow-sm">
        <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg text-primary flex items-center">
                {React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })} 
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);
