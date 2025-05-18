
"use client";

import { useState, useEffect } from "react";
import { getPriceTrendAnalysis, type GetPriceTrendAnalysisOutput } from "@/ai/flows/get-price-trend-analysis";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, HelpCircle, AlertTriangle, BarChart, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface PriceTrendAnalysisCardProps {
  coinName: string | null; // Accept coinName as a prop
}

export function PriceTrendAnalysisCard({ coinName }: PriceTrendAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<GetPriceTrendAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysisCoin, setCurrentAnalysisCoin] = useState<string | null>(null);

  useEffect(() => {
    if (coinName && coinName !== currentAnalysisCoin) {
      handleAnalysis(coinName);
    } else if (!coinName) {
      setAnalysis(null);
      setError(null);
      setCurrentAnalysisCoin(null);
    }
  }, [coinName]);

  const handleAnalysis = async (nameOfCoinToAnalyze: string) => {
    if (!nameOfCoinToAnalyze.trim()) {
      setError("No coin selected for trend analysis.");
      setAnalysis(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setCurrentAnalysisCoin(nameOfCoinToAnalyze);

    try {
      const result = await getPriceTrendAnalysis({ coinName: nameOfCoinToAnalyze });
      setAnalysis(result);
    } catch (err) {
      console.error("Error getting price trend analysis:", err);
      setError(`Failed to get price trend analysis for ${nameOfCoinToAnalyze}. The AI might be charting its course, please try again.`);
      setAnalysis(null);
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
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <BarChart className="mr-2 h-6 w-6" /> Price Trend Analysis
        </CardTitle>
        <CardDescription>
          {currentAnalysisCoin ? `AI price trend for ${currentAnalysisCoin}:` : "Price trend analysis will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         {!coinName && (
             <div className="text-center text-muted-foreground py-8">
                <Info className="mx-auto h-8 w-8 mb-2" />
                <p>Select a coin above to see its price trend analysis.</p>
            </div>
        )}
        {isLoading && coinName && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Analyzing price trends for {currentAnalysisCoin}...</p>
          </div>
        )}
        {error && coinName && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Trend Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && !isLoading && currentAnalysisCoin === coinName && (
          <div className="space-y-3">
            <InfoItem icon={<TrendingUp className="text-primary"/>} label="Current Trend Outlook" value={analysis.currentTrendOutlook} />
            
            <div>
              <h4 className="font-medium text-muted-foreground flex items-center mb-1 text-sm"><HelpCircle className="text-primary mr-2 h-4 w-4"/>Key Driving Factors:</h4>
              {analysis.keyDrivingFactors.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-muted-foreground">
                  {analysis.keyDrivingFactors.map((factor, index) => <li key={index}>{factor}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No specific key factors identified.</p>}
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
                <p className="text-xs text-muted-foreground pt-2 border-t border-dashed mt-2">{analysis.disclaimer}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <p className="text-xs text-muted-foreground">Note: This AI analysis is speculative.</p>
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
        <h4 className="font-medium text-muted-foreground flex items-center mb-1 text-sm">{icon} <span className="ml-2">{label}:</span></h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-2">{value}</p>
    </div>
);
