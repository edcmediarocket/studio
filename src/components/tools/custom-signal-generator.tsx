
"use client";

import React, { useState, useEffect } from "react";
import { getCustomizedCoinTradingSignal, type GetCustomizedCoinTradingSignalInput, type GetCustomizedCoinTradingSignalOutput } from "@/ai/flows/get-customized-coin-trading-signal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Sparkles, AlertTriangle, Info, BarChart, Target, ShieldCheck, FileText, DollarSign } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StatItem } from '@/components/shared/stat-item';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";

export function CustomSignalGenerator() {
  const [coinName, setCoinName] = useState("");
  const [timeframe, setTimeframe] = useState<GetCustomizedCoinTradingSignalInput['timeframe'] | undefined>(undefined);
  const [riskProfile, setRiskProfile] = useState<GetCustomizedCoinTradingSignalInput['riskProfile'] | undefined>(undefined);
  
  const [signalData, setSignalData] = useState<GetCustomizedCoinTradingSignalOutput | null>(null);
  const [isLoadingSignal, setIsLoadingSignal] = useState(false);
  const [signalError, setSignalError] = useState<string | null>(null);

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
      setCurrentCoinPrice(null);

      let coinId = coinName.trim().toLowerCase();
      const coinIdMappings: { [key: string]: string } = {
        "xrp": "ripple",
        "shiba inu": "shiba-inu",
        "dogecoin": "dogecoin",
      };
      coinId = coinIdMappings[coinId] || coinId.replace(/\s+/g, '-');


      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
          const apiErrorMessage = errorData?.error || `CoinGecko API error (Status: ${response.status})`;
          if (response.status === 404 || apiErrorMessage.toLowerCase().includes('could not find coin with id')) {
            setPriceError(`Could not find current price for "${coinName}". Please check the coin name/ID or try an alternative ID (e.g., 'ripple' for XRP).`);
          } else {
            setPriceError(`Failed to fetch current price: ${apiErrorMessage}`);
          }
          setCurrentCoinPrice(null);
        } else {
          const data = await response.json();
          if (data[coinId] && data[coinId].usd !== undefined) {
            setCurrentCoinPrice(data[coinId].usd);
            setPriceError(null);
          } else {
            setPriceError(`Current price not available for "${coinName}" from CoinGecko. The coin ID '${coinId}' might be incorrect or not tracked for simple price.`);
            setCurrentCoinPrice(null);
          }
        }
      } catch (err) {
        console.error("Error fetching current price:", err);
        if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
          setPriceError(`Network error: Failed to fetch price for "${coinName}". Please check your internet connection and try again.`);
        } else if (err instanceof Error) {
          setPriceError(`An unexpected error occurred while fetching the price for "${coinName}": ${err.message}`);
        } 
        else {
          setPriceError(`An unexpected error occurred while fetching the price for "${coinName}".`);
        }
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
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [coinName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !timeframe || !riskProfile) {
      setSignalError("Please fill in all fields: Coin Name, Timeframe, and Risk Profile.");
      setSignalData(null);
      return;
    }
    setIsLoadingSignal(true);
    setSignalError(null);
    setSignalData(null);
    try {
      const result = await getCustomizedCoinTradingSignal({
        coinName: coinName.trim(),
        currentPriceUSD: currentCoinPrice !== null ? currentCoinPrice : undefined, // Pass current price
        timeframe,
        riskProfile,
      });
      setSignalData(result);
    } catch (err) {
      console.error("Error getting customized signal:", err);
      setSignalError("Failed to generate signal. The AI might be recalibrating its crystal ball, please try again.");
    } finally {
      setIsLoadingSignal(false);
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
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-2xl text-primary">
            <Wand2 className="mr-2 h-6 w-6" /> Custom Signal Wizard
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm">
              <p>
                Generate tailored AI trading signals by specifying a coin,
                your desired trading timeframe (e.g., 1H, 4H, 1D), and your
                personal risk profile (Low, Medium, High). The AI provides
                a recommendation, analysis, and specific trading targets.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <CardDescription>
          Define your parameters and let our AI craft a trading signal tailored to your needs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="custom-coinName">Coin Name</Label>
            <Input
              id="custom-coinName"
              type="text"
              placeholder="e.g., Pepe, Bonk, Bitcoin"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoadingSignal || priceLoading}
              className="mt-1"
            />
          </div>
          
          {priceLoading && (
            <div className="flex items-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fetching current price...
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
                  {currentCoinPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentCoinPrice > 0.01 ? 2 : 8 })}
                </p>
              </CardContent>
            </Card>
          )}


          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-timeframe">Timeframe</Label>
              <Select
                value={timeframe}
                onValueChange={(value) => setTimeframe(value as GetCustomizedCoinTradingSignalInput['timeframe'])}
                disabled={isLoadingSignal}
              >
                <SelectTrigger id="custom-timeframe" className="mt-1">
                  <SelectValue placeholder="Select timeframe..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1H">1 Hour</SelectItem>
                  <SelectItem value="4H">4 Hours</SelectItem>
                  <SelectItem value="1D">1 Day</SelectItem>
                  <SelectItem value="1W">1 Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="custom-riskProfile">Risk Profile</Label>
              <Select
                value={riskProfile}
                onValueChange={(value) => setRiskProfile(value as GetCustomizedCoinTradingSignalInput['riskProfile'])}
                disabled={isLoadingSignal}
              >
                <SelectTrigger id="custom-riskProfile" className="mt-1">
                  <SelectValue placeholder="Select risk profile..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button type="submit" disabled={isLoadingSignal || priceLoading || !coinName.trim() || !timeframe || !riskProfile} className="w-full bg-primary hover:bg-primary/90">
            {isLoadingSignal ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Custom AI Signal
              </>
            )}
          </Button>
        </form>

        {signalError && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Signal Generation Error</AlertTitle>
            <AlertDescription>{signalError}</AlertDescription>
          </Alert>
        )}

        {signalData && (
          <div className="mt-8 space-y-6">
            <Separator />
            <h3 className="text-xl font-semibold text-neon text-center">
              Custom AI Signal for: {coinName.trim().toUpperCase()}
            </h3>
            <CardDescription className="text-center -mt-4">
              Timeframe: <Badge variant="outline">{timeframe}</Badge> | Risk Profile: <Badge variant="outline">{riskProfile}</Badge>
            </CardDescription>

            <div className="flex flex-col items-center space-y-2 text-center p-4 bg-muted/30 rounded-lg">
              <Badge variant={getRecommendationBadgeVariant(signalData.recommendation)} className="text-lg px-4 py-1.5 font-semibold">
                {signalData.recommendation}
              </Badge>
              <p className="text-sm text-muted-foreground">{signalData.reasoning}</p>
              <div>
                <span className="text-sm font-medium text-foreground">AI Confidence: {signalData.confidenceScore}%</span>
                <Progress value={signalData.confidenceScore} className="h-2 mt-1 [&>div]:bg-neon max-w-xs mx-auto" />
              </div>
            </div>
            
            <InfoCard icon={<BarChart className="h-5 w-5" />} title="Detailed Analysis">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{signalData.detailedAnalysis}</p>
            </InfoCard>

            <Card className="bg-card shadow-sm">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center"><Target className="mr-2 h-5 w-5"/>AI Recommended Trading Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5 !p-0">
                    <StatItem label="Entry Point" value={signalData.priceTargets.entryPoint || "Market"} className="px-4 py-2" valueClassName="text-sm"/>
                    <StatItem label="Stop-Loss" value={signalData.priceTargets.stopLoss} className="px-4 py-2" valueClassName="text-sm"/>
                    <StatItem label="Take Profit 1" value={signalData.priceTargets.takeProfit1} className="px-4 py-2" valueClassName="text-sm"/>
                    {signalData.priceTargets.takeProfit2 && <StatItem label="Take Profit 2" value={signalData.priceTargets.takeProfit2} className="px-4 py-2" valueClassName="text-sm"/>}
                </CardContent>
            </Card>

            <InfoCard icon={<FileText className="h-5 w-5" />} title="AI Strategy Notes">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{signalData.strategyNotes}</p>
            </InfoCard>

            {signalData.disclaimer && (
              <p className="text-xs text-muted-foreground pt-4 border-t border-dashed mt-4">{signalData.disclaimer}</p>
            )}
          </div>
        )}
        {!isLoadingSignal && !signalData && !signalError && (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <Wand2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Enter details above to generate your custom AI trading signal.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-4">
        <p className="text-xs text-muted-foreground">
          Disclaimer: Customized AI signals are for informational purposes only and not financial advice. High-risk strategies involve a greater chance of loss. Current market price is fetched from CoinGecko.
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
)

