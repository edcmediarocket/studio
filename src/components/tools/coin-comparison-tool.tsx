
"use client";

import { useState } from "react";
import { compareMemeCoins, type CompareMemeCoinsOutput, type CompareMemeCoinsInput } from "@/ai/flows/compare-meme-coins";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Keep for potential future use, but using select now
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitCompareArrows, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

// Placeholder data for coins - in a real app, this might come from an API or dynamic search
const availableCoins = ["Dogecoin", "Shiba Inu", "Pepe", "Bonk", "Floki Inu", "Memecoin", "Dogwifhat", "Book of Meme"];

export function CoinComparisonTool() {
  const [coin1Name, setCoin1Name] = useState<string>("");
  const [coin2Name, setCoin2Name] = useState<string>("");
  const [comparisonResult, setComparisonResult] = useState<CompareMemeCoinsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!coin1Name || !coin2Name) {
      setError("Please select two coins to compare.");
      return;
    }
    if (coin1Name === coin2Name) {
      setError("Please select two different coins.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setComparisonResult(null);

    try {
      const result = await compareMemeCoins({ coin1Name, coin2Name });
      setComparisonResult(result);
    } catch (err) {
      console.error("Error comparing coins:", err);
      setError("Failed to compare coins. The AI might need a moment, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <GitCompareArrows className="mr-2 h-6 w-6" /> AI Coin Comparison
        </CardTitle>
        <CardDescription>
          Compare key metrics and AI insights for two meme coins.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <Label htmlFor="coin1-select">Select Coin 1</Label>
            <Select value={coin1Name} onValueChange={setCoin1Name}>
              <SelectTrigger id="coin1-select">
                <SelectValue placeholder="Choose coin..." />
              </SelectTrigger>
              <SelectContent>
                {availableCoins.map(c => <SelectItem key={`c1-${c}`} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="coin2-select">Select Coin 2</Label>
            <Select value={coin2Name} onValueChange={setCoin2Name}>
              <SelectTrigger id="coin2-select">
                <SelectValue placeholder="Choose coin..." />
              </SelectTrigger>
              <SelectContent>
                {availableCoins.map(c => <SelectItem key={`c2-${c}`} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Button onClick={handleCompare} disabled={isLoading || !coin1Name || !coin2Name} className="w-full bg-primary hover:bg-primary/90">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Compare Coins with AI"
          )}
        </Button>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {comparisonResult && (
          <div className="mt-6 space-y-4">
            <h3 className="text-xl font-semibold text-neon mb-2">Comparison: <span className="text-foreground">{coin1Name}</span> vs <span className="text-foreground">{coin2Name}</span></h3>
            
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px] text-primary">Metric</TableHead>
                    <TableHead className="text-left text-foreground">{coin1Name}</TableHead>
                    <TableHead className="text-left text-foreground">{coin2Name}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonResult.comparisonTable.map((data) => (
                    <TableRow key={data.metric}>
                      <TableCell className="font-medium text-muted-foreground">{data.metric}</TableCell>
                      <TableCell className="text-left">{data.coin1Value}</TableCell>
                      <TableCell className="text-left">{data.coin2Value}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Card className="bg-card">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg text-primary">AI Summary</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{comparisonResult.overallSummary}</p>
                </CardContent>
            </Card>
            {comparisonResult.disclaimer && (
              <p className="text-xs text-muted-foreground text-center pt-2">{comparisonResult.disclaimer}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
