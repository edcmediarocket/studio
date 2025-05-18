
"use client";

import { useState, useEffect } from "react";
import { getWhaleMovementAnalysis, type GetWhaleMovementAnalysisOutput } from "@/ai/flows/get-whale-movement-analysis";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, AlertCircle, Search, ShieldAlert, Info } from "lucide-react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WhaleMovementAnalysisCardProps {
  coinName: string | null; // Accept coinName as a prop
}

export function WhaleMovementAnalysisCard({ coinName }: WhaleMovementAnalysisCardProps) {
  const [analysis, setAnalysis] = useState<GetWhaleMovementAnalysisOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAnalysisCoin, setCurrentAnalysisCoin] = useState<string | null>(null);

  useEffect(() => {
    if (coinName && coinName !== currentAnalysisCoin) {
      handleAnalysis(coinName);
    } else if (!coinName) {
      setAnalysis(null);
      setError(null);
      setCurrentAnalysisCoin(null);
    }
  }, [coinName]);

  const handleAnalysis = async (nameOfCoinToAnalyze: string) => {
    if (!nameOfCoinToAnalyze.trim()) {
      setError("No coin selected for whale movement analysis.");
      setAnalysis(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setCurrentAnalysisCoin(nameOfCoinToAnalyze);

    try {
      const result = await getWhaleMovementAnalysis({ coinName: nameOfCoinToAnalyze });
      setAnalysis(result);
    } catch (err) {
      console.error("Error getting whale movement analysis:", err);
      setError(`Failed to get whale movement analysis for ${nameOfCoinToAnalyze}. The AI is currently whale watching, please try again.`);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <ShieldAlert className="mr-2 h-6 w-6" /> Whale Movement
        </CardTitle>
        <CardDescription>
          {currentAnalysisCoin ? `AI whale analysis for ${currentAnalysisCoin}:` : "Whale movement analysis will appear here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
         {!coinName && (
             <div className="text-center text-muted-foreground py-8">
                <Info className="mx-auto h-8 w-8 mb-2" />
                <p>Select a coin above to see its whale movement analysis.</p>
            </div>
        )}
        {isLoading && coinName && (
          <div className="text-center py-8">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-muted-foreground">Analyzing whale activity for {currentAnalysisCoin}...</p>
          </div>
        )}
        {error && coinName && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Whale Analysis Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {analysis && !isLoading && currentAnalysisCoin === coinName && (
          <div className="space-y-3">
            <InfoItem icon={<Users className="text-primary"/>} label="Typical Activity Summary" value={analysis.activitySummary} />
            <InfoItem icon={<AlertCircle className="text-primary"/>} label="Potential Impact" value={analysis.potentialImpact} />

            <div>
              <h4 className="font-medium text-muted-foreground flex items-center mb-1 text-sm"><Search className="text-primary mr-2 h-4 w-4"/>Detection Indicators:</h4>
              {analysis.detectionIndicators.length > 0 ? (
                <ul className="list-disc list-inside space-y-1 pl-2 text-sm text-muted-foreground">
                  {analysis.detectionIndicators.map((indicator, index) => <li key={index}>{indicator}</li>)}
                </ul>
              ) : <p className="text-sm text-muted-foreground italic">No specific indicators identified.</p>}
            </div>
            
            {analysis.dataCaveat && (
                <Alert variant="default" className="mt-3 border-primary/50 text-sm">
                    <ShieldAlert className="h-4 w-4 text-primary" />
                    <AlertTitle className="text-primary text-sm">Important Note</AlertTitle>
                    <AlertDescription className="text-muted-foreground text-xs">{analysis.dataCaveat}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
        <p className="text-xs text-muted-foreground">Note: This analysis is generalized.</p>
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
        <h4 className="font-medium text-muted-foreground flex items-center mb-1 text-sm">{icon} <span className="ml-2">{label}:</span></h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap pl-2">{value}</p>
    </div>
);
