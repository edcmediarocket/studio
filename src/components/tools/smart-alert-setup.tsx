
"use client";

import React, { useState } from "react";
import { setupSmartAlert, type SetupSmartAlertInput, type SetupSmartAlertOutput } from "@/ai/flows/setup-smart-alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, BellPlus, Sparkles, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

// Define Metric and Condition types locally based on availableOptions
type Metric = "Price" | "MarketCap" | "Volume24hChangePercent" | "SocialMentions";
type Condition = "exceeds" | "dropsBelow" | "increasesByPercent" | "decreasesByPercent";

const availableMetrics: { value: Metric; label: string }[] = [
  { value: "Price", label: "Price (USD)" },
  { value: "MarketCap", label: "Market Cap (USD)" },
  { value: "Volume24hChangePercent", label: "24h Volume Change (%)" },
  { value: "SocialMentions", label: "Social Mentions (Count)" },
];

const availableConditions: { value: Condition; label: string }[] = [
  { value: "exceeds", label: "Exceeds" },
  { value: "dropsBelow", label: "Drops Below" },
  { value: "increasesByPercent", label: "Increases By %" },
  { value: "decreasesByPercent", label: "Decreases By %" },
];

export function SmartAlertSetup() {
  const [coinName, setCoinName] = useState("");
  const [metric, setMetric] = useState<Metric | undefined>(undefined);
  const [condition, setCondition] = useState<Condition | undefined>(undefined);
  const [targetValue, setTargetValue] = useState<string>("");
  const [timeframe, setTimeframe] = useState<string>("");

  const [alertResponse, setAlertResponse] = useState<SetupSmartAlertOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const needsTimeframe = condition === "increasesByPercent" || condition === "decreasesByPercent";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !metric || !condition || !targetValue.trim()) {
      setError("Please fill in all required fields: Coin Name, Metric, Condition, and Target Value.");
      setAlertResponse(null);
      return;
    }
    if (needsTimeframe && !timeframe.trim()) {
      setError("Timeframe is required for percentage-based conditions.");
      setAlertResponse(null);
      return;
    }

    const numericTargetValue = parseFloat(targetValue);
    if (isNaN(numericTargetValue)) {
      setError("Target value must be a valid number.");
      setAlertResponse(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setAlertResponse(null);

    try {
      const input: SetupSmartAlertInput = {
        coinName: coinName.trim(),
        metric,
        condition,
        targetValue: numericTargetValue,
        timeframe: needsTimeframe ? timeframe.trim() : undefined,
      };
      const result = await setupSmartAlert(input);
      setAlertResponse(result);
    } catch (err) {
      console.error("Error setting up smart alert:", err);
      setError("Failed to set up smart alert. The AI might be busy, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <BellPlus className="mr-2 h-6 w-6" /> Configure Your Smart Alert
        </CardTitle>
        <CardDescription>
          Define parameters for your alert. The AI will confirm and provide insights on the scenario. (This is a simulation; no real alerts are created).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alert-coinName">Coin Name</Label>
              <Input
                id="alert-coinName"
                type="text"
                placeholder="e.g., Dogecoin, Pepe"
                value={coinName}
                onChange={(e) => setCoinName(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="alert-metric">Metric</Label>
              <Select
                value={metric}
                onValueChange={(value) => setMetric(value as Metric)}
                disabled={isLoading}
              >
                <SelectTrigger id="alert-metric" className="mt-1">
                  <SelectValue placeholder="Select metric..." />
                </SelectTrigger>
                <SelectContent>
                  {availableMetrics.map(m => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="alert-condition">Condition</Label>
              <Select
                value={condition}
                onValueChange={(value) => setCondition(value as Condition)}
                disabled={isLoading}
              >
                <SelectTrigger id="alert-condition" className="mt-1">
                  <SelectValue placeholder="Select condition..." />
                </SelectTrigger>
                <SelectContent>
                  {availableConditions.map(c => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alert-targetValue">Target Value</Label>
              <Input
                id="alert-targetValue"
                type="number"
                step="any"
                placeholder={condition?.includes("Percent") ? "e.g., 20 (for 20%)" : "e.g., 0.25"}
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          </div>

          {needsTimeframe && (
            <div>
              <Label htmlFor="alert-timeframe">Timeframe (for % change)</Label>
              <Input
                id="alert-timeframe"
                type="text"
                placeholder="e.g., 1h, 24h, 7d"
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                disabled={isLoading}
                className="mt-1"
              />
            </div>
          )}
          
          <Button type="submit" disabled={isLoading || !coinName.trim() || !metric || !condition || !targetValue.trim()} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Analyze & Setup Alert (Simulated)
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Alert Setup Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {alertResponse && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neon">
                AI Alert Analysis & Confirmation
              </h3>
              <p className="text-sm text-muted-foreground">Processed: {new Date(alertResponse.setupTimestamp).toLocaleString()}</p>
            </div>
            
            <Card className="bg-card shadow-sm">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center">
                        <CheckCircle className="mr-2 h-5 w-5 text-green-500" /> Alert Confirmation
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{alertResponse.alertConfirmation}</p>
                </CardContent>
            </Card>

            <Card className="bg-card shadow-sm">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center">
                        <Sparkles className="mr-2 h-5 w-5 text-neon" /> AI Scenario Analysis
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{alertResponse.scenarioAnalysis}</p>
                </CardContent>
            </Card>
            
            {alertResponse.disclaimer && (
              <Alert variant="default" className="mt-6 border-primary/30 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-muted-foreground text-xs">{alertResponse.disclaimer}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
         {!isLoading && !alertResponse && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <BellPlus className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Define your alert parameters above for AI analysis.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           Smart alerts are for informational and simulation purposes only. No real-time monitoring is performed.
         </p>
      </CardFooter>
    </Card>
  );
}
