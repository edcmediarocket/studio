
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getAlphaFeedIdeas, type GetAlphaFeedIdeasOutput, type TradeIdea, AlphaIdeaTypeOptions } from "@/ai/flows/get-alpha-feed-ideas";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Info, RefreshCw, Sparkles, Target, ShieldHalf, CalendarDays, Brain, TrendingUp, Zap, Filter, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { formatDistanceToNow } from 'date-fns';

export function AlphaFeedDisplay() {
  const [feedData, setFeedData] = useState<GetAlphaFeedIdeasOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | undefined>(undefined);

  const ideaTypes = AlphaIdeaTypeOptions; // Use the exported options array

  const fetchFeed = useCallback(async (filter?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getAlphaFeedIdeas({ filter });
      setFeedData(result);
    } catch (err) {
      console.error("Error fetching alpha feed:", err);
      setError("Failed to fetch AI Alpha Feed. The AI might be strategizing, please try again later.");
      setFeedData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(selectedFilter);
  }, [fetchFeed, selectedFilter]);

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value === "ALL_TYPES" ? undefined : value);
  };

  const clearFilter = () => {
    setSelectedFilter(undefined);
  };

  const getSignalColor = (signal: TradeIdea['signal']) => {
    if (signal === "Buy" || signal === "Accumulate") return "text-green-400 border-green-400/70 bg-green-500/10";
    if (signal === "Consider Short") return "text-red-400 border-red-400/70 bg-red-500/10";
    return "text-yellow-400 border-yellow-400/70 bg-yellow-500/10"; // For "Watch"
  };

  const getRiskColor = (risk: TradeIdea['riskRewardProfile']) => {
    if (risk.toLowerCase().includes("high risk")) return "border-red-500 text-red-500";
    if (risk.toLowerCase().includes("medium risk")) return "border-yellow-500 text-yellow-500";
    if (risk.toLowerCase().includes("low risk")) return "border-green-500 text-green-500";
    return "border-purple-500 text-purple-500"; // For speculative/asymmetric
  };

  if (isLoading && !feedData) { // Show initial full loader only if no data yet
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Fetching latest AI Alpha ideas...</p>
      </div>
    );
  }

  if (error && !feedData) { // Show error only if no data yet
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Alpha Feed Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={() => fetchFeed(selectedFilter)} variant="link" className="p-0 h-auto ml-2 text-destructive-foreground">Try again</Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="p-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto sm:max-w-xs">
            <Label htmlFor="alpha-filter" className="text-xs text-muted-foreground">Filter by Idea Type</Label>
            <Select value={selectedFilter || "ALL_TYPES"} onValueChange={handleFilterChange} disabled={isLoading}>
              <SelectTrigger id="alpha-filter" className="mt-1">
                <SelectValue placeholder="Filter by Idea Type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL_TYPES">All Idea Types</SelectItem>
                {ideaTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {selectedFilter && (
            <Button onClick={clearFilter} variant="ghost" size="sm" className="text-xs sm:ml-2" disabled={isLoading}>
              <X className="mr-1.5 h-3 w-3" /> Clear Filter
            </Button>
          )}
           <Button onClick={() => fetchFeed(selectedFilter)} variant="outline" size="sm" disabled={isLoading} className="ml-auto">
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
        </div>
         {feedData?.lastGenerated && (
            <p className="text-xs text-muted-foreground mt-3 text-center sm:text-right">
              Last generated: {formatDistanceToNow(new Date(feedData.lastGenerated), { addSuffix: true })}
            </p>
          )}
      </Card>
      
      {isLoading && feedData && ( // Show subtle loader when refreshing
          <div className="flex items-center justify-center text-muted-foreground py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Updating feed...
          </div>
      )}

      {!isLoading && error && feedData && ( // Show error if refresh fails but old data exists
           <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Refresh Error</AlertTitle>
              <AlertDescription>Could not update feed: {error}</AlertDescription>
            </Alert>
      )}


      {!isLoading && !error && (!feedData || feedData.feedItems.length === 0) && (
        <div className="text-center py-10">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {selectedFilter ? `No Alpha ideas found for "${selectedFilter}".` : "No Alpha ideas available from AI at the moment."}
          </p>
           {selectedFilter && <Button onClick={clearFilter} variant="link" className="mt-2">Show all ideas</Button>}
        </div>
      )}

      {feedData && feedData.feedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedData.feedItems.map((idea, index) => (
            <Card key={`${idea.symbol}-${index}-${idea.lastGeneratedTime || ''}`} className="shadow-lg hover:shadow-neon/20 transition-shadow duration-300 flex flex-col bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="text-lg text-primary flex items-center">
                    <Sparkles className="h-5 w-5 mr-2 text-neon opacity-80" />
                    {idea.coinName} <span className="text-sm text-muted-foreground ml-1.5">({idea.symbol.toUpperCase()})</span>
                  </CardTitle>
                  <Badge variant="outline" className={`text-xs ${getSignalColor(idea.signal)}`}>{idea.signal}</Badge>
                </div>
                <CardDescription className="text-xs text-muted-foreground">{idea.ideaType}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 text-sm">
                <InfoItem icon={<ShieldHalf className="h-4 w-4 text-primary/80"/>} label="Risk/Reward" value={idea.riskRewardProfile} valueClassName={getRiskColor(idea.riskRewardProfile)} />
                <InfoItem icon={<TrendingUp className="h-4 w-4 text-primary/80"/>} label="Market Context" value={idea.marketConditionContext} />
                <InfoItem icon={<CalendarDays className="h-4 w-4 text-primary/80"/>} label="Narrative Timing" value={idea.narrativeTimingContext} />
                
                <div>
                  <h4 className="font-semibold text-primary/90 flex items-center mb-1 text-xs"><Brain className="h-4 w-4 mr-1.5"/>Rationale:</h4>
                  <p className="text-muted-foreground text-xs leading-relaxed bg-muted/30 p-2 rounded-md">{idea.rationale}</p>
                </div>

                {idea.keyMetricsToWatch && idea.keyMetricsToWatch.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-primary/90 text-xs mb-0.5">Key Metrics to Watch:</h5>
                    <ul className="list-disc list-inside pl-2 space-y-0.5">
                      {idea.keyMetricsToWatch.map((metric, mIndex) => (
                        <li key={mIndex} className="text-muted-foreground text-xs">{metric}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between items-center pt-3 mt-auto border-t border-border/50">
                <div className="text-xs text-muted-foreground">
                  Timeframe: <span className="font-medium text-foreground">{idea.suggestedTimeframe}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-medium text-muted-foreground">Confidence:</span>
                  <Progress value={idea.confidenceScore} className="h-1.5 w-16 mt-0.5 inline-block ml-1 [&>div]:bg-neon" title={`${idea.confidenceScore}%`} />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      {feedData && feedData.disclaimer && (
         <Alert variant="default" className="mt-8 border-primary/30 text-sm">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground text-xs">{feedData.disclaimer}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, valueClassName = "text-muted-foreground" }) => (
  <div className="text-xs">
    <h4 className="font-semibold text-primary/90 flex items-center mb-0.5">
      {icon}
      <span className="ml-1.5">{label}:</span>
    </h4>
    <p className={`${valueClassName} pl-5 leading-relaxed`}>{value}</p>
  </div>
);

// Helper type for lastGeneratedTime which is not in schema but can be used for key
declare module "@/ai/flows/get-alpha-feed-ideas" {
  interface TradeIdea {
    lastGeneratedTime?: string;
  }
}

    