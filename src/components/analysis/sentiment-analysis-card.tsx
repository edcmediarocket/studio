"use client";

import { useState } from "react";
import { analyzeMemeCoinSentiment, type AnalyzeMemeCoinSentimentOutput } from "@/ai/flows/analyze-meme-coin-sentiment";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, MessageSquareText, Newspaper, TrendingUp, TrendingDown, Meh } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function SentimentAnalysisCard() {
  const [coinName, setCoinName] = useState("");
  const [sentimentData, setSentimentData] = useState<AnalyzeMemeCoinSentimentOutput | null>(null);
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
    setSentimentData(null);
    try {
      const result = await analyzeMemeCoinSentiment({ coinName });
      setSentimentData(result);
    } catch (err) {
      console.error("Error analyzing sentiment:", err);
      setError("Failed to analyze sentiment. Please try again.");
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
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <MessageSquareText className="mr-2 h-6 w-6" /> Social Sentiment Analysis
        </CardTitle>
        <CardDescription>
          Get real-time social sentiment insights for any meme coin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter coin name (e.g., Dogecoin, SHIB)"
            value={coinName}
            onChange={(e) => setCoinName(e.target.value)}
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Analyze Sentiment"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {sentimentData && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-neon">Analysis for: {coinName.toUpperCase()}</h3>
            
            <Card className="bg-background/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  {getSentimentIcon(sentimentData.overallSentiment)}
                  <span className="ml-2">Overall Sentiment</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Badge variant="outline" className={`text-lg font-semibold px-3 py-1 ${getSentimentColor(sentimentData.overallSentiment)}`}>
                  {sentimentData.overallSentiment || "N/A"}
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-background/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center"><Newspaper className="mr-2 h-5 w-5 text-primary" />Sentiment Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sentimentData.sentimentBreakdown || "No breakdown available."}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-background/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center"><MessageSquareText className="mr-2 h-5 w-5 text-primary" />Key Discussion Points</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{sentimentData.keyDiscussionPoints || "No key discussion points identified."}</p>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Sentiment analysis is AI-generated and may not always be accurate. DYOR.</p>
      </CardFooter>
    </Card>
  );
}
