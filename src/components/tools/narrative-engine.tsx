
"use client";

import React, { useState } from "react";
import { getMarketNarratives, type GetMarketNarrativesOutput } from "@/ai/flows/get-market-narratives";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lightbulb, Sparkles, AlertTriangle, Info, MessageSquare, TrendingUp, FileText, BarChart } from "lucide-react";
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
  
  const getConfidenceBadgeVariant = (confidence: 'High' | 'Medium' | 'Low' | undefined) => {
    if (confidence === 'High') return 'default'; 
    if (confidence === 'Medium') return 'secondary'; 
    if (confidence === 'Low') return 'destructive'; 
    return 'outline';
  };


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Lightbulb className="mr-2 h-6 w-6" /> Narrative Analysis Input
        </CardTitle>
        <CardDescription>
          Enter a topic (e.g., "Meme Coins", "Ethereum Staking", "Dogecoin") for the AI to generate a detailed narrative insight.
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
          <Button type="submit" disabled={isLoading || !topic.trim()} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Narrative Insight
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

        {narrativeData && narrativeData.narrativeInsight && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neon">
                AI Narrative Insight for: {narrativeData.narrativeInsight.analyzedTopic}
              </h3>
              <div className="text-sm text-muted-foreground mt-1">
                Analysis Date: {narrativeData.narrativeInsight.analysisDate} | AI Confidence: 
                <Badge variant={getConfidenceBadgeVariant(narrativeData.narrativeInsight.confidence)} className="ml-1 text-xs">
                    {narrativeData.narrativeInsight.confidence}
                </Badge>
              </div>
            </div>

            <InfoBlock icon={<FileText className="h-5 w-5"/>} title="Generated Narrative">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{narrativeData.narrativeInsight.generatedNarrative}</p>
            </InfoBlock>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoBlock icon={<BarChart className="h-5 w-5"/>} title="Market Tone">
                <p className="text-base sm:text-sm text-muted-foreground">{narrativeData.narrativeInsight.marketTone}</p>
                </InfoBlock>

                <InfoBlock icon={<TrendingUp className="h-5 w-5"/>} title="Strategic Outlook">
                <p className="text-base sm:text-sm text-muted-foreground">{narrativeData.narrativeInsight.strategicOutlook}</p>
                </InfoBlock>
            </div>


            <InfoBlock icon={<MessageSquare className="h-5 w-5"/>} title="Key Catalysts or Concerns">
              {narrativeData.narrativeInsight.keyCatalystsOrConcerns.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-base sm:text-sm text-muted-foreground">
                  {narrativeData.narrativeInsight.keyCatalystsOrConcerns.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No specific catalysts or concerns identified.</p>}
            </InfoBlock>

            <InfoBlock icon={<Lightbulb className="h-5 w-5"/>} title="Probable Storyline">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{narrativeData.narrativeInsight.probableStoryline}</p>
            </InfoBlock>
            
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
                <p className="text-muted-foreground">Enter a topic above for the AI to generate a detailed narrative insight.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           Narrative insights are speculative and AI-generated. Always DYOR.
         </p>
      </CardFooter>
    </Card>
  );
}

interface InfoBlockProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const InfoBlock: React.FC<InfoBlockProps> = ({icon, title, children}) => (
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
);
