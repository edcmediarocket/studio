"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompareArrows, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Placeholder data for coins - in a real app, this would come from an API or search
const availableCoins = ["Dogecoin", "Shiba Inu", "Pepe", "Bonk", "Floki Inu", "Memecoin"];

interface ComparisonData {
  metric: string;
  coin1Value: string | number;
  coin2Value: string | number;
}

export function CoinComparisonTool() {
  const [coin1, setCoin1] = useState<string>("");
  const [coin2, setCoin2] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<ComparisonData[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!coin1 || !coin2) {
      setError("Please select two coins to compare.");
      return;
    }
    if (coin1 === coin2) {
      setError("Please select two different coins.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);

    // Simulate AI comparison
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Placeholder comparison data
    const mockData: ComparisonData[] = [
      { metric: "Current Price", coin1Value: `$${(Math.random() * 0.5).toFixed(6)}`, coin2Value: `$${(Math.random() * 0.00005).toFixed(8)}` },
      { metric: "Market Cap", coin1Value: `$${(Math.random() * 20e9).toLocaleString()}`, coin2Value: `$${(Math.random() * 10e9).toLocaleString()}` },
      { metric: "24h Volume", coin1Value: `$${(Math.random() * 1e9).toLocaleString()}`, coin2Value: `$${(Math.random() * 0.5e9).toLocaleString()}` },
      { metric: "Social Sentiment", coin1Value: "Positive", coin2Value: "Neutral" },
      { metric: "AI Predicted 1M ROI", coin1Value: `${(Math.random() * 100).toFixed(1)}%`, coin2Value: `${(Math.random() * 150).toFixed(1)}%` },
      { metric: "Community Size", coin1Value: `${(Math.random() * 1e6).toLocaleString()} members`, coin2Value: `${(Math.random() * 0.5e6).toLocaleString()} members` },
    ];
    setComparisonResult(mockData);
    setIsLoading(false);
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <GitCompareArrows className="mr-2 h-6 w-6" /> Coin Comparison Tool
        </CardTitle>
        <CardDescription>
          Compare key metrics and AI insights for two meme coins.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="coin1-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Coin 1</label>
            <Select value={coin1} onValueChange={setCoin1}>
              <SelectTrigger id="coin1-select">
                <SelectValue placeholder="Choose a coin" />
              </SelectTrigger>
              <SelectContent>
                {availableCoins.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="coin2-select" className="block text-sm font-medium text-muted-foreground mb-1">Select Coin 2</label>
            <Select value={coin2} onValueChange={setCoin2}>
              <SelectTrigger id="coin2-select">
                <SelectValue placeholder="Choose a coin" />
              </SelectTrigger>
              <SelectContent>
                {availableCoins.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handleCompare} disabled={isLoading || !coin1 || !coin2} className="w-full bg-primary hover:bg-primary/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Compare Coins"
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {comparisonResult && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold text-neon mb-2">Comparison: <span className="text-foreground">{coin1}</span> vs <span className="text-foreground">{coin2}</span></h3>
            <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Metric</TableHead>
                  <TableHead className="text-right">{coin1}</TableHead>
                  <TableHead className="text-right">{coin2}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comparisonResult.map((data) => (
                  <TableRow key={data.metric}>
                    <TableCell className="font-medium">{data.metric}</TableCell>
                    <TableCell className="text-right">{data.coin1Value}</TableCell>
                    <TableCell className="text-right">{data.coin2Value}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
