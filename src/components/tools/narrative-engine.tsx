
"use client";

import React, { useState } from "react";
import { getMarketNarratives, type GetMarketNarrativesOutput, type MarketNarrative } from "@/ai/flows/get-market-narratives";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lightbulb, Sparkles, AlertTriangle, Info, MessageSquare, TrendingUp, FileText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export function NarrativeEngine() {
  const [topic, setTopic] = useState("");
  const [narrativeData, setNarrativeData] = useState<GetMarketNarrativesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("Please enter a topic, market segment, or coin name.");
      setNarrativeData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setNarrativeData(null);
    try {
      const result = await getMarketNarratives({ topic: topic.trim() });
      setNarrativeData(result);
    } catch (err) {
      console.error("Error getting market narratives:", err);
      setError("Failed to analyze narratives. The AI might be deep in thought, please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getSentimentColor = (sentiment: MarketNarrative['sentiment']) => {
    switch (sentiment) {
      case 'Positive': return 'text-green-400 border-green-400/50';
      case 'Negative': return 'text-red-400 border-red-400/50';
      case 'Neutral': return 'text-yellow-400 border-yellow-400/50';
      case 'Mixed': return 'text-blue-400 border-blue-400/50'; // Example for Mixed
      default: return 'text-muted-foreground border-muted-foreground/50';
    }
  };

  const getStrengthColor = (strength: MarketNarrative['strength']) => {
    switch (strength) {
      case 'Strong': return 'bg-green-500/20 text-green-400';
      case 'Growing': return 'bg-sky-500/20 text-sky-400';
      case 'Fading': return 'bg-amber-500/20 text-amber-400';
      case 'Speculative': return 'bg-purple-500/20 text-purple-400';
      default: return 'bg-muted/20 text-muted-foreground';
    }
  };


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Lightbulb className="mr-2 h-6 w-6" /> Narrative Analysis Input
        </CardTitle>
        <CardDescription>
          Enter a topic (e.g., "Meme Coins", "Ethereum Staking", "Dogecoin") to detect underlying market narratives.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="narrative-topic">Topic / Coin Name / Market Segment</Label>
            <Input
              id="narrative-topic"
              type="text"
              placeholder="e.g., AI Tokens, Solana Ecosystem, PEPE"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Detect Narratives
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Narrative Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {narrativeData && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neon">
                AI Narrative Analysis for: {narrativeData.analyzedTopic}
              </h3>
              <p className="text-sm text-muted-foreground">Analysis Date: {narrativeData.analysisDate}</p>
              <p className="text-sm mt-1">
                AI Confidence: <Badge variant={narrativeData.confidence === 'High' ? 'default' : narrativeData.confidence === 'Medium' ? 'secondary' : 'destructive'} className="text-xs">{narrativeData.confidence}</Badge>
              </p>
            </div>

            <Card className="bg-card shadow-sm">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center">
                        <MessageSquare className="mr-2 h-5 w-5" /> Overall Market Psychology
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{narrativeData.overallMarketPsychology}</p>
                </CardContent>
            </Card>

            <h4 className="text-lg font-semibold text-primary mt-6 mb-3">Detected Narratives:</h4>
            {narrativeData.detectedNarratives.length > 0 ? (
              narrativeData.detectedNarratives.map((item, index) => (
                <Card key={index} className="bg-muted/30 shadow-md">
                  <CardHeader className="pb-3 pt-4">
                    <CardTitle className="text-md text-foreground flex items-center justify-between">
                      <span>{item.narrative}</span>
                       <Badge variant="outline" className={`ml-auto text-xs ${getStrengthColor(item.strength)}`}>{item.strength}</Badge>
                    </CardTitle>
                     <CardDescription className="text-xs">
                       Sentiment: <span className={`font-semibold ${getSentimentColor(item.sentiment)}`}>{item.sentiment}</span>
                     </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Potential Impact:</p>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.potentialImpact}</p>
                    </div>
                    {item.keyEvidenceSnippets.length > 0 && (
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 mt-2">Simulated Key Evidence:</p>
                            <ul className="space-y-1">
                                {item.keyEvidenceSnippets.map((snippet, sIndex) =>(
                                    <li key={sIndex} className="text-xs text-muted-foreground/80 italic p-1.5 bg-background/30 rounded-sm border-l-2 border-primary/50">"{snippet}"</li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">No specific narratives detected by AI for this topic.</p>
            )}
            
            {narrativeData.disclaimer && (
              <Alert variant="default" className="mt-6 border-primary/30 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-muted-foreground text-xs">{narrativeData.disclaimer}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
         {!isLoading && !narrativeData && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <Lightbulb className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Enter a topic above for the AI to analyze emerging market narratives.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           Narrative analysis is speculative and AI-generated. Always DYOR.
         </p>
      </CardFooter>
    </Card>
  );
}
