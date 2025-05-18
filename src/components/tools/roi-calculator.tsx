
"use client";

import { useState } from "react";
import { predictMemeCoinRoi, type PredictMemeCoinRoiOutput } from "@/ai/flows/predict-meme-coin-roi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calculator, TrendingUp, Percent, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export function RoiCalculator() {
  const [coinName, setCoinName] = useState("");
  const [investmentAmount, setInvestmentAmount] = useState<number | string>("");
  const [predictionHorizon, setPredictionHorizon] = useState("1 month");
  const [roiData, setRoiData] = useState<PredictMemeCoinRoiOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim() || !investmentAmount || Number(investmentAmount) <= 0) {
      setError("Please fill in all fields with valid values.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setRoiData(null);
    try {
      const result = await predictMemeCoinRoi({
        coinName,
        investmentAmount: Number(investmentAmount),
        predictionHorizon,
      });
      setRoiData(result);
    } catch (err) {
      console.error("Error predicting ROI:", err);
      setError("Failed to predict ROI. The AI might be busy, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (level: string | undefined) => {
    const l = level?.toLowerCase();
    if (l === 'high') return 'bg-green-500 text-green-50';
    if (l === 'medium') return 'bg-yellow-500 text-yellow-50';
    if (l === 'low') return 'bg-red-500 text-red-50';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="shadow-lg w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Calculator className="mr-2 h-6 w-6" /> AI Meme Coin ROI Calculator
        </CardTitle>
        <CardDescription>
          Estimate potential ROI for meme coins using AI predictions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="coinName-roi">Coin Name</Label>
            <Input
              id="coinName-roi"
              type="text"
              placeholder="e.g., Doge, Shiba Inu"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="investmentAmount">Investment Amount (USD)</Label>
            <Input
              id="investmentAmount"
              type="number"
              placeholder="e.g., 100"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(e.target.value)}
              disabled={isLoading}
              min="1"
            />
          </div>
          <div>
            <Label htmlFor="predictionHorizon">Prediction Horizon</Label>
            <Select
              value={predictionHorizon}
              onValueChange={setPredictionHorizon}
              disabled={isLoading}
            >
              <SelectTrigger id="predictionHorizon">
                <SelectValue placeholder="Select horizon" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1 week">1 Week</SelectItem>
                <SelectItem value="1 month">1 Month</SelectItem>
                <SelectItem value="6 months">6 Months</SelectItem>
                <SelectItem value="1 year">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Predict ROI"
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {roiData && (
          <div className="mt-6 space-y-4 p-4 border rounded-md bg-card">
            <h3 className="text-xl font-semibold text-neon">ROI Prediction for: {coinName.toUpperCase()}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col items-center p-3 bg-muted rounded-md">
                <Percent className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Predicted ROI</span>
                <span className="text-2xl font-bold text-neon">
                  {(roiData.predictedRoi * 100).toFixed(2)}%
                </span>
              </div>
              <div className="flex flex-col items-center p-3 bg-muted rounded-md">
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <span className="text-sm text-muted-foreground">Predicted Value</span>
                <span className="text-2xl font-bold text-neon">
                  ${roiData.predictedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">Confidence Level: </span>
              <Badge className={`px-3 py-1 text-sm ${getConfidenceColor(roiData.confidenceLevel)}`}>{roiData.confidenceLevel || "N/A"}</Badge>
            </div>
            
            <div>
              <h4 className="font-semibold text-primary flex items-center"><Info className="w-4 h-4 mr-2"/>Reasoning:</h4>
              <p className="text-base sm:text-sm text-muted-foreground mt-1 p-2 bg-muted rounded-md whitespace-pre-wrap">{roiData.detailedReasoning || "No reasoning provided."}</p> {/* Updated from roiData.reasoning */}
            </div>
            {/* Display alternative scenarios, risks, catalysts if needed - structure similar to reasoning */}
             {roiData.disclaimer && (
                <p className="text-xs text-muted-foreground pt-2 border-t border-dashed mt-3">{roiData.disclaimer}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">
          Disclaimer: ROI predictions are AI-generated estimates and not financial advice. Invest responsibly.
        </p>
      </CardFooter>
    </Card>
  );
}
