
"use client";

import { useState } from "react";
import { getPriceTrendAnalysis, type GetPriceTrendAnalysisOutput } from "@/ai/flows/get-price-trend-analysis";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, TrendingUp, HelpCircle, AlertTriangle, BarChart } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function PriceTrendAnalysisCard() {
  const [coinName, setCoinName] = useState("");
  const [analysis, setAnalysis] = useState<GetPriceTrendAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) {
      setError("Please enter a coin name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await getPriceTrendAnalysis({ coinName });
      setAnalysis(result);
    } catch (err) {
      console.error("Error getting price trend analysis:", err);
      setError("Failed to get price trend analysis. The AI might be charting its course, please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getConfidenceColor = (level: string | undefined) => {
    const l = level?.toLowerCase();
    if (l === 'high') return 'bg-green-500 text-green-50';
    if (l === 'medium') return 'bg-yellow-500 text-yellow-50';
    if (l === 'low') return 'bg-red-500 text-red-50';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <BarChart className="mr-2 h-6 w-6" /> AI Price Trend Analysis
        </CardTitle>
        <CardDescription>
          Get AI-generated textual analysis on potential price trends for a meme coin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="coinName-trend">Coin Name</Label>
            <Input
              id="coinName-trend"
              type="text"
              placeholder="e.g., Dogecoin, SHIB"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Price Trends"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-neon">Trend Analysis for: {coinName.toUpperCase()}</h3>
            
            <InfoItem icon={<TrendingUp className="text-primary"/>} label="Current Trend Outlook" value={analysis.currentTrendOutlook} />
            
            <div>
              <h4 className="font-medium text-muted-foreground flex items-center mb-1"><HelpCircle className="text-primary mr-2 h-4 w-4"/>Key Driving Factors:</h4>
              {analysis.keyDrivingFactors.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-base sm:text-sm text-muted-foreground">
                  {analysis.keyDrivingFactors.map((factor, index) => <li key={index}>{factor}</li>)}
                </ul>
              ) : <p className="text-base sm:text-sm text-muted-foreground italic">No specific key factors identified by AI.</p>}
            </div>

            <InfoItem icon={<HelpCircle className="text-primary"/>} label="Potential Scenarios" value={analysis.potentialScenarios} />
            
            {analysis.supportResistanceLevels && (
              <InfoItem icon={<AlertTriangle className="text-primary"/>} label="Speculative Support/Resistance" value={analysis.supportResistanceLevels} />
            )}

            <div className="text-sm">
              <span className="font-medium text-muted-foreground">AI Confidence: </span>
              <Badge className={`px-2 py-0.5 ${getConfidenceColor(analysis.confidence)}`}>{analysis.confidence || "N/A"}</Badge>
            </div>

            {analysis.disclaimer && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-dashed mt-3">{analysis.disclaimer}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Note: This AI analysis is speculative and not financial advice.</p>
      </CardFooter>
    </Card>
  );
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value}) => (
    <div>
        <h4 className="font-medium text-muted-foreground flex items-center mb-1">{icon} <span className="ml-2">{label}:</span></h4>
        <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap pl-2">{value}</p>
    </div>
);
