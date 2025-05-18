
"use client";

import React, { useState } from "react";
import { getPredictionConfidenceInsights, type GetPredictionConfidenceInsightsOutput } from "@/ai/flows/get-prediction-confidence-insights";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldQuestion, Sparkles, AlertTriangle, Info, TrendingUp, BarChart, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip as RechartsTooltip } from 'recharts';
import { ChartTooltipContent, ChartContainer, ChartConfig } from "@/components/ui/chart"


const predictionTypes = [
  "7-day Price Trend",
  "24h Price Prediction",
  "Next Major Move Signal",
  "ROI Prediction (1 Month)",
  "Market Sentiment Analysis"
];

export function PredictionConfidenceDashboard() {
  const [coinName, setCoinName] = useState("");
  const [predictionType, setPredictionType] = useState<string | undefined>(undefined);
  const [insightsData, setInsightsData] = useState<GetPredictionConfidenceInsightsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !predictionType) {
      setError("Please enter a coin name and select a prediction type.");
      setInsightsData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setInsightsData(null);
    try {
      const result = await getPredictionConfidenceInsights({ coinName: coinName.trim(), predictionType });
      setInsightsData(result);
    } catch (err) {
      console.error("Error getting prediction confidence insights:", err);
      setError("Failed to retrieve confidence insights. The AI might be contemplating its own certainty, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const radarChartConfig = {
    score: {
      label: "Confidence Score",
      color: "hsl(var(--neon-accent-hsl))",
    },
  } satisfies ChartConfig;
  

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <ShieldQuestion className="mr-2 h-6 w-6" /> Confidence Analysis Input
        </CardTitle>
        <CardDescription>
          Select a coin and prediction type to view AI-simulated confidence metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="confidence-coinName">Coin Name</Label>
              <Input
                id="confidence-coinName"
                type="text"
                placeholder="e.g., Bitcoin, Dogecoin"
                value={coinName}
                onChange={(e) => setCoinName(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="confidence-predictionType">Prediction Type</Label>
              <Select
                value={predictionType}
                onValueChange={setPredictionType}
                disabled={isLoading}
              >
                <SelectTrigger id="confidence-predictionType" className="mt-1">
                  <SelectValue placeholder="Select prediction type..." />
                </SelectTrigger>
                <SelectContent>
                  {predictionTypes.map(ptype => (
                    <SelectItem key={ptype} value={ptype}>{ptype}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isLoading || !coinName.trim() || !predictionType} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Analyze Confidence
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Confidence Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {insightsData && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neon">
                AI Confidence Insights for: {insightsData.coinName.toUpperCase()}
              </h3>
              <p className="text-sm text-muted-foreground">Prediction Type: {insightsData.predictionType}</p>
              <p className="text-xs text-muted-foreground">Analysis as of: {insightsData.analysisTimestamp}</p>
            </div>
            
            <Card className="bg-card shadow-md text-center p-6">
              <CardHeader className="p-0 mb-2">
                <Activity className="h-10 w-10 text-primary mx-auto mb-1" />
                <CardTitle className="text-md text-muted-foreground">Overall AI Confidence</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-4xl font-bold text-neon mb-1">{insightsData.overallConfidenceScore} <span className="text-2xl text-muted-foreground">/ 100</span></p>
                <Progress value={insightsData.overallConfidenceScore} className="h-3 [&>div]:bg-neon" />
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-muted/30 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg text-primary flex items-center">
                    <BarChart className="mr-2 h-5 w-5" /> Confidence Factors (Radar)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] sm:h-[350px]">
                  {insightsData.radarChartData && insightsData.radarChartData.length > 0 ? (
                    <ChartContainer config={radarChartConfig} className="w-full h-full">
                      <ResponsiveContainer>
                        <RadarChart data={insightsData.radarChartData}>
                          <PolarGrid stroke="hsl(var(--border))" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }} />
                          <Radar name={insightsData.coinName} dataKey="score" stroke="hsl(var(--neon-accent-hsl))" fill="hsl(var(--neon-accent-hsl))" fillOpacity={0.6} />
                          <RechartsTooltip content={<ChartTooltipContent indicator="dot" />} wrapperStyle={{ outline: "none" }} />
                          <Legend wrapperStyle={{fontSize: "12px"}} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : <p className="text-sm text-muted-foreground text-center py-4">No radar chart data available.</p>}
                </CardContent>
              </Card>

              <Card className="bg-muted/30 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                  <CardTitle className="text-lg text-primary flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5" /> Simulated Confidence Trend
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-4">
                  {insightsData.confidenceTrend && insightsData.confidenceTrend.length > 0 ? (
                    insightsData.confidenceTrend.map((trend, index) => (
                      <div key={index}>
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm font-medium text-muted-foreground">{trend.period}</span>
                          <span className="text-sm font-semibold text-foreground">{trend.confidence}/100</span>
                        </div>
                        <Progress value={trend.confidence} className="h-2 [&>div]:bg-primary/70" />
                      </div>
                    ))
                  ) : <p className="text-sm text-muted-foreground text-center py-4">No confidence trend data available.</p>}
                </CardContent>
              </Card>
            </div>

            <InfoBlock icon={<Info className="h-5 w-5 text-primary" />} title="Key Factors Influencing Confidence">
              {insightsData.keyFactorsInfluencingConfidence.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {insightsData.keyFactorsInfluencingConfidence.map((factor, index) => <li key={index}>{factor}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No specific key factors identified.</p>}
            </InfoBlock>

            <InfoBlock icon={<Sparkles className="h-5 w-5 text-primary" />} title="Prediction Drift Summary">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{insightsData.predictionDriftSummary}</p>
            </InfoBlock>
            
            {insightsData.disclaimer && (
              <Alert variant="default" className="mt-6 border-primary/30 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-muted-foreground text-xs">{insightsData.disclaimer}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
         {!isLoading && !insightsData && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <ShieldQuestion className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select a coin and prediction type to view AI-simulated confidence insights.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           Confidence visualizations are based on AI-simulated data and are for illustrative purposes. DYOR.
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
