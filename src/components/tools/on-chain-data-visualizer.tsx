
"use client";

import { useState } from "react";
import { getOnchainInsights, type GetOnchainInsightsOutput } from "@/ai/flows/get-onchain-insights";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Activity, Info, Users, BarChartBig, Shuffle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function OnChainDataVisualizer() {
  const [coinName, setCoinName] = useState("");
  const [insights, setInsights] = useState<GetOnchainInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) {
      setError("Please enter a coin name.");
      setInsights(null); // Clear previous insights if any
      return;
    }
    setIsLoading(true);
    setError(null);
    setInsights(null);
    try {
      const result = await getOnchainInsights({ coinName });
      setInsights(result);
    } catch (err) {
      console.error("Error getting on-chain insights:", err);
      setError("Failed to get on-chain insights. The AI might be exploring the blockchain, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Activity className="mr-2 h-6 w-6" /> AI On-Chain Insights
        </CardTitle>
        <CardDescription>
          Get AI-generated textual analysis of typical on-chain characteristics for a meme coin.
          This tool provides general insights, not real-time specific data visualization.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="coinName-onchain">Coin Name</Label>
            <Input
              id="coinName-onchain"
              type="text"
              placeholder="e.g., Dogecoin, Pepe"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading || !coinName.trim()} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Get AI On-Chain Insights"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
             <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insights && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-neon">On-Chain Insights for: {coinName.toUpperCase()}</h3>
            
            <InsightCategoryCard title="Holder Distribution Analysis" icon={<Users className="h-5 w-5 text-primary" />} content={insights.holderDistributionAnalysis} />
            <InsightCategoryCard title="Transaction Patterns" icon={<BarChartBig className="h-5 w-5 text-primary" />} content={insights.transactionPatterns} />
            <InsightCategoryCard title="Smart Contract Activity" icon={<Shuffle className="h-5 w-5 text-primary" />} content={insights.smartContractActivity} />
            <InsightCategoryCard title="Token Flow Observations" icon={<Activity className="h-5 w-5 text-primary" />} content={insights.tokenFlowObservations} />
            
            {insights.dataCaveat && (
              <Alert variant="default" className="mt-4 border-primary/50">
                <Info className="h-4 w-4 text-primary" />
                <AlertTitle className="text-primary">Important Note</AlertTitle>
                <AlertDescription className="text-muted-foreground text-xs">{insights.dataCaveat}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
         {!isLoading && !insights && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Enter a coin name above to get AI-generated on-chain insights.</p>
                <p className="text-xs text-muted-foreground/80 mt-2">These are general textual analyses, not live charts.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-4">
         <p className="text-xs text-muted-foreground pt-2">
           Remember: These are generalized AI insights, not real-time financial or on-chain data.
         </p>
      </CardFooter>
    </Card>
  );
}

interface InsightCategoryCardProps {
    title: string;
    icon: React.ReactNode;
    content: string;
}

const InsightCategoryCard: React.FC<InsightCategoryCardProps> = ({ title, icon, content }) => {
    return (
        <Card className="bg-background/50">
            <CardHeader className="pb-2 flex flex-row items-center space-x-2 pt-4">
                {icon}
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="pt-2">
                <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{content || "No specific insights available from AI for this category."}</p>
            </CardContent>
        </Card>
    );
};
