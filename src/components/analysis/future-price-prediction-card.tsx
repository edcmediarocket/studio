
"use client";

import { useState, useEffect } from "react";
import { getFuturePricePrediction, type GetFuturePricePredictionOutput } from "@/ai/flows/get-future-price-prediction";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, HelpCircle, AlertTriangle, CalendarClock, Info, Zap } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FuturePricePredictionCardProps {
  coinName: string | null;
}

export function FuturePricePredictionCard({ coinName }: FuturePricePredictionCardProps) {
  const [predictionData, setPredictionData] = useState<GetFuturePricePredictionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysisCoin, setCurrentAnalysisCoin] = useState<string | null>(null);

  useEffect(() => {
    if (coinName && coinName !== currentAnalysisCoin) {
      handlePrediction(coinName);
    } else if (!coinName) {
      setPredictionData(null);
      setError(null);
      setCurrentAnalysisCoin(null);
    }
  }, [coinName, currentAnalysisCoin]); // Added currentAnalysisCoin to dependencies

  const handlePrediction = async (nameOfCoinToAnalyze: string) => {
    if (!nameOfCoinToAnalyze.trim()) {
      setError("No coin selected for price prediction.");
      setPredictionData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setPredictionData(null);
    setCurrentAnalysisCoin(nameOfCoinToAnalyze);

    try {
      const result = await getFuturePricePrediction({ coinName: nameOfCoinToAnalyze });
      setPredictionData(result);
    } catch (err) {
      console.error("Error getting future price prediction:", err);
      setError(`Failed to get future price prediction for ${nameOfCoinToAnalyze}. The AI's crystal ball might be cloudy, please try again.`);
      setPredictionData(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const getConfidenceColor = (level?: "High" | "Medium" | "Low") => {
    const l = level?.toLowerCase();
    if (l === 'high') return 'bg-green-500 text-primary-foreground';
    if (l === 'medium') return 'bg-yellow-500 text-primary-foreground';
    if (l === 'low') return 'bg-red-500 text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <Zap className="mr-2 h-6 w-6" /> AI Future Price Predictions
        </CardTitle>
        <CardDescription>
          {currentAnalysisCoin ? `Speculative AI price outlook for ${currentAnalysisCoin}:` : "Future price predictions will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         {!coinName && (
             <div className="text-center text-muted-foreground py-8">
                <Info className="mx-auto h-8 w-8 mb-2" />
                <p>Select a coin above to see its AI price predictions.</p>
            </div>
        )}
        {isLoading && coinName && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Forecasting prices for {currentAnalysisCoin}...</p>
          </div>
        )}
        {error && coinName && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Prediction Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {predictionData && !isLoading && currentAnalysisCoin === coinName && (
          <div className="space-y-4">
            <div className="text-center">
                <span className="text-sm font-medium text-muted-foreground">AI Confidence: </span>
                <Badge className={`px-3 py-1 text-sm ${getConfidenceColor(predictionData.confidenceLevel)}`}>
                    {predictionData.confidenceLevel || "N/A"}
                </Badge>
            </div>
            <Separator />

            {predictionData.predictions.length > 0 ? (
                <ul className="space-y-2">
                    {predictionData.predictions.map((pred, index) => (
                        <li key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded-md">
                            <span className="text-sm font-medium text-muted-foreground flex items-center">
                                <CalendarClock className="h-4 w-4 mr-2 text-primary" />
                                {pred.timeframe}:
                            </span>
                            <span className="text-sm font-semibold text-neon">{pred.predictedPrice}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground italic text-center">No specific timeframe predictions available.</p>
            )}
            
            <Separator />

            <div>
              <h4 className="font-semibold text-primary flex items-center mb-1 text-sm"><HelpCircle className="text-primary mr-2 h-4 w-4"/>AI Reasoning:</h4>
              <p className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">{predictionData.reasoning}</p>
            </div>

            {predictionData.disclaimer && (
                <Alert variant="default" className="mt-3 border-primary/50 text-sm">
                    <Info className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary text-sm font-semibold">Important Disclaimer</AlertTitle>
                    <AlertDescription className="text-muted-foreground text-xs">{predictionData.disclaimer}</AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <p className="text-xs text-muted-foreground">Note: AI predictions are speculative and for informational purposes only. DYOR.</p>
      </CardFooter>
    </Card>
  );
}
