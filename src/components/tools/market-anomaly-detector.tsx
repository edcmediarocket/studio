
"use client";

import React, { useState } from "react";
import { detectMarketAnomalies, type DetectMarketAnomaliesOutput, type DetectMarketAnomaliesInput } from "@/ai/flows/detect-market-anomalies";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Siren, AlertTriangle, Search, Info, Activity, BarChart, ShieldCheck, MessageSquare } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

const marketSegments = ["Meme Coins", "Top 100 Crypto", "DeFi Tokens", "Gaming Tokens", "AI & Big Data Tokens", "Low Cap Gems"];

export function MarketAnomalyDetector() {
  const [marketSegment, setMarketSegment] = useState<string | undefined>(undefined);
  const [analysisResult, setAnalysisResult] = useState<DetectMarketAnomaliesOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!marketSegment) {
      setError("Please select a market segment to scan.");
      setAnalysisResult(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await detectMarketAnomalies({ marketSegment });
      setAnalysisResult(result);
    } catch (err) {
      console.error("Error detecting market anomalies:", err);
      setError("Failed to detect anomalies. The AI might be observing unusual patterns in itself! Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityBadgeVariant = (severity?: "Critical" | "High" | "Medium" | "Low") => {
    if (severity === 'Critical') return 'destructive';
    if (severity === 'High') return 'destructive'; 
    if (severity === 'Medium') return 'secondary'; 
    if (severity === 'Low') return 'default'; 
    return 'outline';
  };
  
  const getAnomalyIcon = (type: string) => {
    if (type.includes("Price")) return <BarChart className="h-4 w-4 mr-1.5" />;
    if (type.includes("Volume")) return <Activity className="h-4 w-4 mr-1.5" />;
    if (type.includes("Sentiment")) return <MessageSquare className="h-4 w-4 mr-1.5" />;
    if (type.includes("Security")) return <ShieldCheck className="h-4 w-4 mr-1.5" />;
    return <Siren className="h-4 w-4 mr-1.5" />; 
  };


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Search className="mr-2 h-6 w-6" /> Anomaly Scan Configuration
        </CardTitle>
        <CardDescription>
          Select a market segment for the AI to scan for unusual activities or anomalies, including volume surges.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="marketSegment">Market Segment</Label>
            <Select
              value={marketSegment}
              onValueChange={setMarketSegment}
              disabled={isLoading}
            >
              <SelectTrigger id="marketSegment" className="mt-1">
                <SelectValue placeholder="Choose a market segment..." />
              </SelectTrigger>
              <SelectContent>
                {marketSegments.map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading || !marketSegment} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Siren className="mr-2 h-4 w-4" /> Scan for Anomalies
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Anomaly Detection Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysisResult && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neon">
                AI Anomaly Report for: {marketSegment}
              </h3>
              <p className="text-sm text-muted-foreground">Scan performed: {analysisResult.lastScanned}</p>
            </div>

            <Card className="bg-card shadow-sm">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center">
                        <Info className="mr-2 h-5 w-5" /> Overall Summary
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{analysisResult.summary}</p>
                </CardContent>
            </Card>

            {analysisResult.anomalies.length > 0 ? (
              analysisResult.anomalies.map((anomaly, index) => (
                <Card key={index} className="bg-muted/30 shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3 pt-4">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-lg text-foreground flex items-center">
                            {getAnomalyIcon(anomaly.anomalyType)}
                            {anomaly.coinName} <span className="text-sm text-muted-foreground ml-1.5">({anomaly.symbol.toUpperCase()})</span>
                        </CardTitle>
                        <Badge variant={getSeverityBadgeVariant(anomaly.severity)} className="text-xs px-2 py-0.5">{anomaly.severity}</Badge>
                    </div>
                    <CardDescription className="text-xs text-muted-foreground">{anomaly.anomalyType} - Detected {anomaly.timestamp}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {anomaly.anomalyType === "High Trading Volume" && anomaly.volumeChangePercentage ? (
                        <p className="text-sm font-semibold text-primary leading-relaxed">
                            Volume Spike Detected: ${anomaly.symbol.toUpperCase()} up {anomaly.volumeChangePercentage}% vs. 24hr average.
                        </p>
                    ) : null}
                    <p className="text-sm text-muted-foreground leading-relaxed">{anomaly.description}</p>
                    <div>
                        <span className="text-xs font-medium text-muted-foreground">AI Confidence: </span>
                        <Progress value={anomaly.confidence * 100} className="h-1.5 mt-0.5 [&>div]:bg-neon max-w-[100px]" title={`${(anomaly.confidence * 100).toFixed(0)}%`} />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-6">
                <ShieldCheck className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p className="text-muted-foreground">No significant anomalies detected by AI in this segment.</p>
              </div>
            )}
            
            {analysisResult.dataDisclaimer && (
              <p className="text-xs text-muted-foreground pt-4 border-t border-dashed mt-4">{analysisResult.dataDisclaimer}</p>
            )}
          </div>
        )}
        {!isLoading && !analysisResult && !error && (
            <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <Siren className="h-10 w-10 text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Select a market segment and click "Scan for Anomalies" to get the AI report.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-4">
        <p className="text-xs text-muted-foreground">
          Disclaimer: Anomaly detection is AI-simulated and for informational purposes. Always DYOR.
        </p>
      </CardFooter>
    </Card>
  );
}

