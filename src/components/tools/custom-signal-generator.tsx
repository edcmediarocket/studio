
"use client";

import { useState } from "react";
import { getCustomizedCoinTradingSignal, type GetCustomizedCoinTradingSignalInput, type GetCustomizedCoinTradingSignalOutput } from "@/ai/flows/get-customized-coin-trading-signal";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Wand2, Sparkles, AlertTriangle, Info, BarChart, Target, ShieldCheck, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { StatItem } from "@/app/(app)/coin/[id]/page"; // Re-using StatItem for consistent display

export function CustomSignalGenerator() {
  const [coinName, setCoinName] = useState("");
  const [timeframe, setTimeframe] = useState<GetCustomizedCoinTradingSignalInput['timeframe'] | undefined>(undefined);
  const [riskProfile, setRiskProfile] = useState<GetCustomizedCoinTradingSignalInput['riskProfile'] | undefined>(undefined);
  
  const [signalData, setSignalData] = useState<GetCustomizedCoinTradingSignalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !timeframe || !riskProfile) {
      setError("Please fill in all fields: Coin Name, Timeframe, and Risk Profile.");
      setSignalData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSignalData(null);
    try {
      const result = await getCustomizedCoinTradingSignal({
        coinName,
        timeframe,
        riskProfile,
      });
      setSignalData(result);
    } catch (err) {
      console.error("Error getting customized signal:", err);
      setError("Failed to generate signal. The AI might be recalibrating its crystal ball, please try again.");
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
        <CardTitle className="flex items-center text-2xl text-primary">
          <Wand2 className="mr-2 h-6 w-6" /> Custom Signal Wizard
        </CardTitle>
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
              placeholder="e.g., Pepe, Bonk"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="custom-timeframe">Timeframe</Label>
              <Select
                value={timeframe}
                onValueChange={(value) => setTimeframe(value as GetCustomizedCoinTradingSignalInput['timeframe'])}
                disabled={isLoading}
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
                disabled={isLoading}
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
          
          <Button type="submit" disabled={isLoading || !coinName.trim() || !timeframe || !riskProfile} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Custom AI Signal
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {signalData && (
          <div className="mt-8 space-y-6">
            <Separator />
            <h3 className="text-xl font-semibold text-neon text-center">
              Custom AI Signal for: {coinName.toUpperCase()}
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
                    <CardTitle className="text-lg text-primary flex items-center"><Target className="mr-2 h-5 w-5"/>Trading Targets</CardTitle>
                </CardHeader>
                <CardContent className="space-y-0.5 !p-0">
                    <StatItem label="Entry Point" value={signalData.priceTargets.entryPoint || "Market"} className="px-4 py-2" valueClassName="text-sm"/>
                    <StatItem label="Stop-Loss" value={signalData.priceTargets.stopLoss} className="px-4 py-2" valueClassName="text-sm"/>
                    <StatItem label="Take Profit 1" value={signalData.priceTargets.takeProfit1} className="px-4 py-2" valueClassName="text-sm"/>
                    {signalData.priceTargets.takeProfit2 && <StatItem label="Take Profit 2" value={signalData.priceTargets.takeProfit2} className="px-4 py-2" valueClassName="text-sm"/>}
                </CardContent>
            </Card>

            <InfoCard icon={<FileText className="h-5 w-5" />} title="Strategy Notes">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{signalData.strategyNotes}</p>
            </InfoCard>

            {signalData.disclaimer && (
              <p className="text-xs text-muted-foreground pt-4 border-t border-dashed mt-4">{signalData.disclaimer}</p>
            )}
          </div>
        )}
        {!isLoading && !signalData && !error && (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <Wand2 className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Enter details above to generate your custom AI trading signal.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-4">
        <p className="text-xs text-muted-foreground">
          Disclaimer: Customized AI signals are for informational purposes only and not financial advice. High-risk strategies involve a greater chance of loss.
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
