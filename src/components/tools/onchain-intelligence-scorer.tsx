
"use client";

import React, { useState } from "react";
import { getOnChainIntelligence, type GetOnChainIntelligenceOutput } from "@/ai/flows/get-onchain-intelligence";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DatabaseZap, Sparkles, AlertTriangle, Info, ShieldCheck, Users, Activity, Gauge } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

export function OnChainIntelligenceScorer() {
  const [coinName, setCoinName] = useState("");
  const [ocisData, setOcisData] = useState<GetOnChainIntelligenceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) {
      setError("Please enter a coin name to analyze.");
      setOcisData(null);
      return;
    }
    setIsLoading(true);
    setError(null);
    setOcisData(null);
    try {
      const result = await getOnChainIntelligence({ coinName: coinName.trim() });
      setOcisData(result);
    } catch (err) {
      console.error("Error getting on-chain intelligence:", err);
      setError("Failed to retrieve on-chain intelligence. The AI might be crunching big data, please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const getScoreColor = (score: number, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500'; // Ensure orange is defined or use amber/red
    return 'bg-red-500';
  };

  const getWMIColor = (score: number) => {
    if (score > 50) return 'bg-green-500'; // Strong buying
    if (score > 10) return 'bg-green-400'; // Buying
    if (score >= -10) return 'bg-yellow-500'; // Neutral
    if (score >= -50) return 'bg-red-400';   // Selling
    return 'bg-red-500'; // Strong selling
  };

  const getContractRiskColor = (riskLevel: GetOnChainIntelligenceOutput['contractAuditInsights']['riskLevel']) => {
    switch (riskLevel) {
      case 'Low': return 'bg-green-500 text-primary-foreground';
      case 'Medium': return 'bg-yellow-500 text-primary-foreground';
      case 'High': return 'bg-orange-500 text-primary-foreground'; // Ensure orange is defined or use amber/red
      case 'Critical': return 'bg-red-500 text-primary-foreground';
      case 'Not Applicable': return 'bg-muted text-muted-foreground';
      default: return 'bg-gray-400 text-primary-foreground';
    }
  };

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <DatabaseZap className="mr-2 h-6 w-6" /> AI OCIS Input
        </CardTitle>
        <CardDescription>
          Enter a coin name to get its AI-generated On-Chain Intelligence Score (OCIS) and related metrics.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="ocis-coinName">Coin Name</Label>
            <Input
              id="ocis-coinName"
              type="text"
              placeholder="e.g., Bitcoin, Ethereum, Dogecoin"
              value={coinName}
              onChange={(e) => setCoinName(e.target.value)}
              disabled={isLoading}
              className="mt-1"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Get AI On-Chain Intelligence
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>On-Chain Intelligence Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {ocisData && (
          <div className="mt-8 space-y-6">
            <Separator />
            <div className="text-center">
              <h3 className="text-xl font-semibold text-neon">
                AI On-Chain Intelligence for: {ocisData.coinName.toUpperCase()}
              </h3>
            </div>
            
            <Card className="bg-card shadow-md text-center p-6">
              <CardHeader className="p-0 mb-2">
                <Gauge className="h-12 w-12 text-primary mx-auto mb-2" />
                <CardTitle className="text-lg text-muted-foreground">Overall OCIS Score</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <p className="text-5xl font-bold text-neon mb-2">{ocisData.ocisScore} <span className="text-2xl text-muted-foreground">/ 100</span></p>
                <Progress value={ocisData.ocisScore} className={`h-4 [&>div]:${getScoreColor(ocisData.ocisScore)}`} />
                <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap">{ocisData.ocisInterpretation}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoMetricCard title="Whale Momentum Index (WMI)" icon={<Users className="text-primary h-6 w-6"/>} score={ocisData.whaleMomentumIndex} interpretation={ocisData.wmiInterpretation} scoreFormatter={(s) => `${s}/100`} progressColor={getWMIColor(ocisData.whaleMomentumIndex)} maxScore={100} minScore={-100} />
              <InfoMetricCard title="Smart Wallet Accumulation (SWAS)" icon={<Activity className="text-primary h-6 w-6"/>} score={ocisData.smartWalletAccumulationScore} interpretation={ocisData.swasInterpretation} progressColor={getScoreColor(ocisData.smartWalletAccumulationScore)} />
            </div>
            
            <Card className="bg-muted/30 shadow-sm">
                <CardHeader className="pb-2 pt-4">
                    <CardTitle className="text-lg text-primary flex items-center">
                        <ShieldCheck className="mr-2 h-5 w-5" /> Smart Contract Audit Insights
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground">Simulated Risk Level:</span>
                      <Badge className={`text-xs ${getContractRiskColor(ocisData.contractAuditInsights.riskLevel)}`}>{ocisData.contractAuditInsights.riskLevel}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ocisData.contractAuditInsights.summary}</p>
                    <p className="text-xs text-muted-foreground/80">Last Simulated Audit: {ocisData.contractAuditInsights.lastSimulatedAudit}</p>
                </CardContent>
            </Card>
            
            {ocisData.dataCaveat && (
              <Alert variant="default" className="mt-6 border-primary/30 text-sm">
                <Info className="h-4 w-4 text-primary" />
                <AlertDescription className="text-muted-foreground text-xs">{ocisData.dataCaveat}</AlertDescription>
              </Alert>
            )}
          </div>
        )}
         {!isLoading && !ocisData && !error && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <DatabaseZap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Enter a coin name above for its AI-generated On-Chain Intelligence Score.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           OCIS scores and interpretations are AI-simulated and for informational purposes only. DYOR.
         </p>
      </CardFooter>
    </Card>
  );
}

interface InfoMetricCardProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  interpretation: string;
  scoreFormatter?: (score: number) => string;
  progressColor?: string;
  maxScore?: number;
  minScore?: number;
}

const InfoMetricCard: React.FC<InfoMetricCardProps> = ({ title, icon, score, interpretation, scoreFormatter, progressColor, maxScore = 100, minScore = 0 }) => {
  const displayScore = scoreFormatter ? scoreFormatter(score) : `${score}/${maxScore}`;
  const progressValue = ((score - minScore) / (maxScore - minScore)) * 100;

  return (
    <Card className="bg-muted/30 shadow-sm flex flex-col">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md text-primary flex items-center">
            {icon}
            <span className="ml-2">{title}</span>
          </CardTitle>
          <Badge variant="outline" className="text-lg font-bold text-neon border-neon/50">{displayScore}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-2">
        <Progress value={progressValue} className={`h-2 [&>div]:${progressColor || 'bg-primary'}`} />
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">{interpretation}</p>
      </CardContent>
    </Card>
  );
};

