
"use client";

import { useState } from "react";
import { getWhaleMovementAnalysis, type GetWhaleMovementAnalysisOutput } from "@/ai/flows/get-whale-movement-analysis";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Users, AlertCircle, Search, ShieldAlert } from "lucide-react"; // Using ShieldAlert as a "Whale" icon proxy
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function WhaleMovementAnalysisCard() {
  const [coinName, setCoinName] = useState("");
  const [analysis, setAnalysis] = useState<GetWhaleMovementAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) {
      setError("Please enter a coin name.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    try {
      const result = await getWhaleMovementAnalysis({ coinName });
      setAnalysis(result);
    } catch (err) {
      console.error("Error getting whale movement analysis:", err);
      setError("Failed to get whale movement analysis. The AI is currently whale watching, please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <ShieldAlert className="mr-2 h-6 w-6" /> AI Whale Movement Analysis
        </CardTitle>
        <CardDescription>
          AI-generated insights on typical whale activity patterns for a meme coin.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="coinName-whale">Coin Name</Label>
            <Input
              id="coinName-whale"
              type="text"
              placeholder="e.g., Dogecoin, Bonk"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Analyze Whale Activity"}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-semibold text-neon">Whale Analysis for: {coinName.toUpperCase()}</h3>
            
            <InfoItem icon={<Users className="text-primary"/>} label="Typical Activity Summary" value={analysis.activitySummary} />
            <InfoItem icon={<AlertCircle className="text-primary"/>} label="Potential Impact" value={analysis.potentialImpact} />

            <div>
              <h4 className="font-medium text-muted-foreground flex items-center mb-1"><Search className="text-primary mr-2 h-4 w-4"/>Potential Detection Indicators:</h4>
              {analysis.detectionIndicators.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-base sm:text-sm text-muted-foreground">
                  {analysis.detectionIndicators.map((indicator, index) => <li key={index}>{indicator}</li>)}
                </ul>
              ) : <p className="text-base sm:text-sm text-muted-foreground italic">No specific indicators identified by AI.</p>}
            </div>
            
            {analysis.dataCaveat && (
                <Alert variant="default" className="mt-4 border-primary/50">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary">Important Note</AlertTitle>
                    <AlertDescription className="text-muted-foreground">{analysis.dataCaveat}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">Note: This analysis is generalized and not based on real-time wallet tracking.</p>
      </CardFooter>
    </Card>
  );
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value}) => (
    <div>
        <h4 className="font-medium text-muted-foreground flex items-center mb-1">{icon} <span className="ml-2">{label}:</span></h4>
        <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap pl-2">{value}</p>
    </div>
);
