
"use client";

import { useState, useEffect } from "react";
import { analyzeMemeCoinSentiment, type AnalyzeMemeCoinSentimentOutput } from "@/ai/flows/analyze-meme-coin-sentiment";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquareText, Newspaper, TrendingUp, TrendingDown, Meh, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

interface SentimentAnalysisCardProps {
  coinName: string | null; // Accept coinName as a prop
}

export function SentimentAnalysisCard({ coinName }: SentimentAnalysisCardProps) {
  const [sentimentData, setSentimentData] = useState<AnalyzeMemeCoinSentimentOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysisCoin, setCurrentAnalysisCoin] = useState<string | null>(null);


  useEffect(() => {
    if (coinName && coinName !== currentAnalysisCoin) { // Analyze if coinName is new and valid
      handleAnalysis(coinName);
    } else if (!coinName) { // Clear data if coinName is cleared
      setSentimentData(null);
      setError(null);
      setCurrentAnalysisCoin(null);
    }
  }, [coinName]); // Re-run analysis when coinName prop changes

  const handleAnalysis = async (nameOfCoinToAnalyze: string) => {
    if (!nameOfCoinToAnalyze.trim()) {
      setError("No coin selected for sentiment analysis.");
      setSentimentData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setSentimentData(null);
    setCurrentAnalysisCoin(nameOfCoinToAnalyze); // Store the coin name being analyzed

    try {
      const result = await analyzeMemeCoinSentiment({ coinName: nameOfCoinToAnalyze });
      setSentimentData(result);
    } catch (err) {
      console.error("Error analyzing sentiment:", err);
      setError(`Failed to analyze sentiment for ${nameOfCoinToAnalyze}. Please try again or check the coin name.`);
      setSentimentData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string | undefined) => {
    if (!sentiment) return <Meh className="h-5 w-5 text-muted-foreground" />;
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes("positive")) return <TrendingUp className="h-5 w-5 text-green-500" />;
    if (lowerSentiment.includes("negative")) return <TrendingDown className="h-5 w-5 text-red-500" />;
    return <Meh className="h-5 w-5 text-yellow-500" />;
  };
  
  const getSentimentColor = (sentiment: string | undefined) => {
    if (!sentiment) return "border-muted-foreground";
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes("positive")) return "border-green-500 text-green-500";
    if (lowerSentiment.includes("negative")) return "border-red-500 text-red-500";
    return "border-yellow-500 text-yellow-500";
  };


  return (
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <MessageSquareText className="mr-2 h-6 w-6" /> Social Sentiment
        </CardTitle>
        <CardDescription>
          {currentAnalysisCoin ? `AI sentiment for ${currentAnalysisCoin}:` : "Social sentiment analysis will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {!coinName && (
             <div className="text-center text-muted-foreground py-8">
                <Info className="mx-auto h-8 w-8 mb-2" />
                <p>Select a coin above to see its sentiment analysis.</p>
            </div>
        )}
        {isLoading && coinName && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Analyzing sentiment for {currentAnalysisCoin}...</p>
          </div>
        )}
        {error && coinName && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Sentiment Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {sentimentData && !isLoading && currentAnalysisCoin === coinName && (
          <div className="space-y-3">            
            <Card className="bg-background/50">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-md flex items-center">
                  {getSentimentIcon(sentimentData.overallSentiment)}
                  <span className="ml-2">Overall Sentiment</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <Badge variant="outline" className={`text-md font-semibold px-3 py-1 ${getSentimentColor(sentimentData.overallSentiment)}`}>
                  {sentimentData.overallSentiment || "N/A"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-md flex items-center"><Newspaper className="mr-2 h-4 w-4 text-primary" />Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sentimentData.sentimentBreakdown || "No breakdown."}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50">
              <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-md flex items-center"><MessageSquareText className="mr-2 h-4 w-4 text-primary" />Discussion Points</CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sentimentData.keyDiscussionPoints || "None identified."}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <p className="text-xs text-muted-foreground">Sentiment data is AI-generated. DYOR.</p>
      </CardFooter>
    </Card>
  );
}
