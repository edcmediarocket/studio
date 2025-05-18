
"use client";

import { useState } from "react";
import { predictMemeCoinRoi, type PredictMemeCoinRoiOutput } from "@/ai/flows/predict-meme-coin-roi";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Calculator, TrendingUp, Percent, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
    if (l === 'high') return 'bg-green-500 text-primary-foreground';
    if (l === 'medium') return 'bg-yellow-500 text-primary-foreground';
    if (l === 'low') return 'bg-red-500 text-primary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="shadow-lg w-full max-w-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Calculator className="mr-2 h-6 w-6" /> AI Meme Coin ROI Calculator
        </CardTitle>
        <CardDescription>
          Estimate potential ROI for meme coins using AI predictions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="coinName-roi">Coin Name</Label>
            <Input
              id="coinName-roi"
              type="text"
              placeholder="e.g., Doge, Shiba Inu"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
              className="mt-1"
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
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="predictionHorizon">Prediction Horizon</Label>
            <Select
              value={predictionHorizon}
              onValueChange={setPredictionHorizon}
              disabled={isLoading}
            >
              <SelectTrigger id="predictionHorizon" className="mt-1">
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
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {roiData && (
          <div className="mt-8 space-y-6">
            <Separator />
            <h3 className="text-xl font-semibold text-neon text-center">ROI Prediction for: {coinName.toUpperCase()}</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-muted/50 p-4 text-center">
                <CardHeader className="p-0 mb-2">
                  <Percent className="h-8 w-8 text-primary mx-auto" />
                  <CardTitle className="text-sm text-muted-foreground mt-1">Predicted ROI</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-3xl font-bold text-neon">
                    {(roiData.predictedRoi * 100).toFixed(2)}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-muted/50 p-4 text-center">
                <CardHeader className="p-0 mb-2">
                  <TrendingUp className="h-8 w-8 text-primary mx-auto" />
                  <CardTitle className="text-sm text-muted-foreground mt-1">Predicted Value</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-3xl font-bold text-neon">
                    ${roiData.predictedValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <span className="text-sm font-medium text-muted-foreground">AI Confidence: </span>
              <Badge className={`px-3 py-1 text-sm ${getConfidenceColor(roiData.confidenceLevel)}`}>{roiData.confidenceLevel || "N/A"}</Badge>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="text-lg font-semibold text-primary flex items-center mb-2"><Info className="w-5 h-5 mr-2"/>Detailed Reasoning:</h4>
              <p className="text-base sm:text-sm text-muted-foreground p-3 bg-muted/50 rounded-md whitespace-pre-wrap">{roiData.detailedReasoning || "No reasoning provided."}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-primary mb-2 flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-500"/>Potential Catalysts:</h5>
                {roiData.potentialCatalysts.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {roiData.potentialCatalysts.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                ) : <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md">None identified.</p>}
              </div>
              <div>
                <h5 className="font-semibold text-primary mb-2 flex items-center"><XCircle className="w-5 h-5 mr-2 text-red-500"/>Risk Factors:</h5>
                {roiData.riskFactors.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                    {roiData.riskFactors.map((item, index) => <li key={index}>{item}</li>)}
                  </ul>
                ) : <p className="text-sm text-muted-foreground italic bg-muted/50 p-3 rounded-md">None identified.</p>}
              </div>
            </div>
            
            <div>
                <h5 className="font-semibold text-primary mb-2">Alternative Scenarios:</h5>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Card className="flex-1 bg-muted/30 p-3">
                        <CardContent className="p-0 text-sm">
                            <p className="text-muted-foreground">Optimistic ROI: <span className="font-bold text-green-400">{(roiData.alternativeScenarios.optimisticRoi * 100).toFixed(2)}%</span></p>
                        </CardContent>
                    </Card>
                     <Card className="flex-1 bg-muted/30 p-3">
                        <CardContent className="p-0 text-sm">
                           <p className="text-muted-foreground">Pessimistic ROI: <span className="font-bold text-red-400">{(roiData.alternativeScenarios.pessimisticRoi * 100).toFixed(2)}%</span></p>
                        </CardContent>
                    </Card>
                </div>
            </div>


            {roiData.disclaimer && (
                <p className="text-xs text-muted-foreground pt-4 border-t border-dashed mt-4">{roiData.disclaimer}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-4">
        <p className="text-xs text-muted-foreground">
          Disclaimer: ROI predictions are AI-generated estimates and not financial advice. Invest responsibly.
        </p>
      </CardFooter>
    </Card>
  );
}
