"use client";

import React, { useState } from "react";
import { getAggregatedCoinBuzz, type GetAggregatedCoinBuzzOutput } from "@/ai/flows/get-aggregated-coin-buzz";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Newspaper, MessageSquare, Sparkles, AlertTriangle, Info, TrendingUp, TrendingDown, Meh } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export function NewsBuzzAggregator() {
  const [coinName, setCoinName] = useState("");
  const [buzzData, setBuzzData] = useState<GetAggregatedCoinBuzzOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) {
      setError("Please enter a coin name to aggregate buzz.");
      setBuzzData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setBuzzData(null);
    try {
      const result = await getAggregatedCoinBuzz({ coinName: coinName.trim() });
      setBuzzData(result);
    } catch (err) {
      console.error("Error getting aggregated coin buzz:", err);
      setError("Failed to aggregate buzz. The AI might be sifting through too much news, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSentimentIconAndColor = (sentiment: string | undefined) => {
    if (!sentiment) return { icon: <Meh className="h-5 w-5" />, color: "text-muted-foreground" };
    const lowerSentiment = sentiment.toLowerCase();
    if (lowerSentiment.includes("very positive") || lowerSentiment.includes("positive")) return { icon: <TrendingUp className="h-5 w-5" />, color: "text-green-400" };
    if (lowerSentiment.includes("very negative") || lowerSentiment.includes("negative")) return { icon: <TrendingDown className="h-5 w-5" />, color: "text-red-400" };
    return { icon: <Meh className="h-5 w-5" />, color: "text-yellow-400" };
  };

  const getBuzzScoreColor = (score: number) => {
    if (score > 50) return "bg-green-500";
    if (score > 10) return "bg-green-400";
    if (score >= -10) return "bg-yellow-500";
    if (score >= -50) return "bg-red-400";
    return "bg-red-500";
  };
  
  const ListItem: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <li className="text-base sm:text-sm text-muted-foreground leading-relaxed flex items-start">
      <Sparkles className="h-4 w-4 mr-2 mt-1 text-primary flex-shrink-0" />
      <span>{children}</span>
    </li>
  );

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Newspaper className="mr-2 h-6 w-6" /> AI News & Buzz Aggregator
        </CardTitle>
        <CardDescription>
          Enter a meme coin name to get AI-synthesized highlights from recent news and social media.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="buzz-coinName">Coin Name</Label>
            <Input
              id="buzz-coinName"
              type="text"
              placeholder="e.g., Dogecoin, Shiba Inu"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Get AI Buzz Report
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Aggregation Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {buzzData && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neon">
                AI Buzz Report for: {buzzData.coinName.toUpperCase()}
              </h3>
              <p className="text-sm text-muted-foreground">{buzzData.analysisDate}</p>
            </div>
            
            <Card className="bg-card shadow-sm">
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-lg text-primary flex items-center">
                    {getSentimentIconAndColor(buzzData.overallBuzzSentiment).icon}
                    <span className="ml-2">Overall Buzz Sentiment:</span>
                    <Badge variant="outline" className={`ml-2 text-base ${getSentimentIconAndColor(buzzData.overallBuzzSentiment).color}`}>
                        {buzzData.overallBuzzSentiment}
                    </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium text-muted-foreground mb-1">Buzz Score: {buzzData.buzzScore}/100</div>
                <Progress value={(buzzData.buzzScore + 100) / 2} className={`h-3 [&>div]:${getBuzzScoreColor(buzzData.buzzScore)}`} />
              </CardContent>
            </Card>

            <InfoSection icon={<Newspaper className="h-5 w-5 text-primary" />} title="Key News Highlights">
              {buzzData.keyNewsHighlights.length > 0 ? (
                <ul className="space-y-1.5">
                  {buzzData.keyNewsHighlights.map((item, index) => <ListItem key={`news-${index}`}>{item}</ListItem>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No specific news highlights identified by AI.</p>}
            </InfoSection>
            
            <InfoSection icon={<MessageSquare className="h-5 w-5 text-primary" />} title="Social Media Themes">
               {buzzData.socialMediaThemes.length > 0 ? (
                <ul className="space-y-1.5">
                  {buzzData.socialMediaThemes.map((item, index) => <ListItem key={`social-${index}`}>{item}</ListItem>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No dominant social media themes identified by AI.</p>}
            </InfoSection>

            <InfoSection icon={<TrendingUp className="h-5 w-5 text-primary" />} title="Emerging Narratives">
              {buzzData.emergingNarratives.length > 0 ? (
                 <ul className="space-y-1.5">
                  {buzzData.emergingNarratives.map((item, index) => <ListItem key={`narrative-${index}`}>{item}</ListItem>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No specific emerging narratives identified by AI.</p>}
            </InfoSection>

            <InfoSection icon={<Info className="h-5 w-5 text-primary" />} title="Significant Events Mentioned">
              {buzzData.significantEventsMentioned.length > 0 ? (
                 <ul className="space-y-1.5">
                  {buzzData.significantEventsMentioned.map((item, index) => <ListItem key={`event-${index}`}>{item}</ListItem>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No specific significant events mentioned.</p>}
            </InfoSection>

            <Alert variant="default" className="mt-4 border-primary/30 text-sm">
              <Info className="h-4 w-4 text-primary" />
              <AlertTitle className="text-primary text-sm font-semibold">Data Sourcing Note</AlertTitle>
              <AlertDescription className="text-muted-foreground text-xs">{buzzData.dataSourcesNote}</AlertDescription>
            </Alert>

            {buzzData.disclaimer && (
              <p className="text-xs text-muted-foreground pt-4 border-t border-dashed mt-4">{buzzData.disclaimer}</p>
            )}
          </div>
        )}
         {!isLoading && !buzzData && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <Newspaper className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Enter a coin name above to get its AI-aggregated news & social buzz report.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           AI-generated insights are for informational purposes and may not reflect real-time accuracy. Always DYOR.
         </p>
      </CardFooter>
    </Card>
  );
}

interface InfoSectionProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const InfoSection: React.FC<InfoSectionProps> = ({icon, title, children}) => (
    <Card className="bg-card shadow-sm">
        <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg text-primary flex items-center">
                {icon} 
                <span className="ml-2">{title}</span>
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
)
