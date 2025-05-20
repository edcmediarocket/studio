
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getPreLaunchGems, type GetPreLaunchGemsOutput, type PreLaunchGem } from "@/ai/flows/get-pre-launch-gems";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, Info, RefreshCw, Sparkles, Target, ShieldHalf, CalendarDays, Brain, TrendingUp, Zap, Telescope, SearchCode, FileText, RadioTower, Activity } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from 'date-fns';

export function PreLaunchRadarDisplay() {
  const [radarData, setRadarData] = useState<GetPreLaunchGemsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRadarGems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getPreLaunchGems();
      setRadarData(result);
    } catch (err) {
      console.error("Error fetching pre-launch gems:", err);
      setError("Failed to fetch AI Pre-Launch Gems. The AI might be scanning the deep web, please try again later.");
      setRadarData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRadarGems();
  }, [fetchRadarGems]);

  const getScoreColor = (score: number, maxScore = 100) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    if (percentage >= 25) return 'bg-orange-500';
    return 'bg-red-500';
  };


  if (isLoading && !radarData) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Scanning for Pre-Launch Alpha...</p>
      </div>
    );
  }

  if (error && !radarData) {
    return (
      <Alert variant="destructive" className="mt-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Gem Radar Error</AlertTitle>
        <AlertDescription>
          {error}
          <Button onClick={fetchRadarGems} variant="link" className="p-0 h-auto ml-2 text-destructive-foreground">Try again</Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-6">
      <Card className="p-4 shadow-md">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
           <p className="text-sm text-muted-foreground">AI-simulated scan for potential early-stage projects.</p>
           <Button onClick={fetchRadarGems} variant="outline" size="sm" disabled={isLoading} className="ml-auto">
             {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh Scan
          </Button>
        </div>
         {radarData?.lastScanned && (
            <p className="text-xs text-muted-foreground mt-3 text-center sm:text-right">
              Last simulated scan: {formatDistanceToNow(new Date(radarData.lastScanned), { addSuffix: true })}
            </p>
          )}
      </Card>
      
      {isLoading && radarData && ( 
          <div className="flex items-center justify-center text-muted-foreground py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Updating radar...
          </div>
      )}

      {!isLoading && error && radarData && ( 
           <Alert variant="destructive" className="my-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Scan Update Error</AlertTitle>
              <AlertDescription>Could not update scan results: {error}</AlertDescription>
            </Alert>
      )}

      {!isLoading && !error && (!radarData || radarData.gems.length === 0) && (
        <div className="text-center py-10">
          <Telescope className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">AI Gem Radar found no significant signals matching criteria currently.</p>
          <p className="text-xs text-muted-foreground">This space is highly dynamic, check back often.</p>
        </div>
      )}

      {radarData && radarData.gems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {radarData.gems.map((gem, index) => (
            <Card key={`${gem.gemName}-${index}`} className="shadow-lg hover:shadow-neon/20 transition-shadow duration-300 flex flex-col bg-card">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                  <CardTitle className="text-lg text-primary flex items-center">
                    <SearchCode className="h-5 w-5 mr-2 text-neon opacity-80" />
                    {gem.gemName}
                  </CardTitle>
                  {gem.chain && <Badge variant="secondary" className="text-xs">{gem.chain}</Badge>}
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  Launch Window: {gem.estimatedLaunchWindow}
                  {gem.potentialListingPlatform && ` | Platform: ${gem.potentialListingPlatform}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 text-sm">
                <InfoItem icon={<RadioTower className="h-4 w-4 text-primary/80"/>} label="Simulated Buzz Summary" value={gem.simulatedBuzzSummary} valueClassName="text-muted-foreground text-xs bg-muted/30 p-2 rounded"/>
                <InfoItem icon={<Activity className="h-4 w-4 text-primary/80"/>} label="Key Indicators" value={gem.keyIndicators.join('; ') || "N/A"} valueClassName="text-muted-foreground text-xs"/>
                {gem.developerReputationHint && <InfoItem icon={<Brain className="h-4 w-4 text-primary/80"/>} label="Developer Hint" value={gem.developerReputationHint} valueClassName="text-muted-foreground text-xs"/>}
                
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                        <Label className="text-xs text-muted-foreground">Moon Potential</Label>
                        <Progress value={gem.moonPotentialScore} className={`h-2 mt-1 [&>div]:${getScoreColor(gem.moonPotentialScore)}`} title={`${gem.moonPotentialScore}/100`} />
                    </div>
                    <div>
                        <Label className="text-xs text-muted-foreground">Degen Score (Risk)</Label>
                        <Progress value={gem.degenScore} className={`h-2 mt-1 [&>div]:${getScoreColor(gem.degenScore)}`} title={`${gem.degenScore}/100 High is risky`} />
                    </div>
                </div>
              </CardContent>
              {/* <CardFooter className="pt-3 mt-auto border-t border-border/50">
                 <p className="text-xs text-muted-foreground">Highly Speculative. DYOR.</p>
              </CardFooter> */}
            </Card>
          ))}
        </div>
      )}
      {radarData && radarData.disclaimer && (
         <Alert variant="destructive" className="mt-8 border-destructive/70 text-sm">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <AlertTitle className="font-semibold text-destructive">Extreme Risk Warning!</AlertTitle>
            <AlertDescription className="text-destructive-foreground text-xs">{radarData.disclaimer}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}
const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value, valueClassName = "text-muted-foreground" }) => (
  <div className="text-xs">
    <h4 className="font-semibold text-primary/90 flex items-center mb-0.5">
      {icon}
      <span className="ml-1.5">{label}:</span>
    </h4>
    <p className={`${valueClassName} pl-5 leading-relaxed whitespace-pre-wrap`}>{value}</p>
  </div>
);
