
"use client";

import React from 'react'; // Added explicit React import
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HelpCircle, Activity, Users, Layers, TrendingUp } from 'lucide-react';

interface DnaMetric {
  label: string;
  score: number | undefined;
  description: string;
  icon: React.ReactNode;
}

interface TokenDnaStripProps {
  marketCapTierScore?: number;
  communityStrengthScore?: number;
  developerActivityScore?: number;
  memeStrengthScore?: number;
}

const getScoreColor = (score: number | undefined) => {
  if (score === undefined) return "bg-muted";
  if (score >= 75) return "bg-green-500";
  if (score >= 50) return "bg-yellow-500";
  if (score >= 25) return "bg-orange-500";
  return "bg-red-500";
};

export function TokenDnaStrip({
  marketCapTierScore,
  communityStrengthScore,
  developerActivityScore,
  memeStrengthScore,
}: TokenDnaStripProps) {

  const dnaMetrics: DnaMetric[] = [
    { label: "Market Cap Tier", score: marketCapTierScore, description: "Higher score indicates larger, more established market capitalization.", icon: <Layers className="h-4 w-4" /> },
    { label: "Community Strength", score: communityStrengthScore, description: "Reflects social media presence, engagement, and size. Higher is stronger.", icon: <Users className="h-4 w-4" /> },
    { label: "Developer Activity", score: developerActivityScore, description: "Simulated assessment of code commits, project updates, and roadmap progress. Higher is more active.", icon: <Activity className="h-4 w-4" /> },
    { label: "Meme Strength", score: memeStrengthScore, description: "Assesses virality potential and cultural impact. Higher indicates stronger meme potential.", icon: <TrendingUp className="h-4 w-4" /> },
  ];

  const allScoresUndefined = dnaMetrics.every(metric => metric.score === undefined);

  if (allScoresUndefined) {
    return (
      <Card className="bg-muted/30 shadow-sm">
        <CardHeader className="pb-2 pt-3">
          <CardTitle className="text-sm text-primary/90">Token DNA Strip</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground py-3">
          Token DNA scores are not available for this coin.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-muted/30 shadow-sm">
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-sm text-primary/90">Token DNA Strip (AI Assessed Scores 0-100)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pt-2 pb-3">
        {dnaMetrics.map((metric) => (
          metric.score !== undefined ? (
            <React.Fragment key={metric.label}>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center text-xs text-muted-foreground">
                    {React.cloneElement(metric.icon as React.ReactElement, { className: "mr-1.5 h-3.5 w-3.5"})}
                    {metric.label}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className="ml-1 text-muted-foreground hover:text-foreground focus:outline-none">
                          <HelpCircle className="h-3 w-3" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 text-xs p-2">
                        {metric.description}
                      </PopoverContent>
                    </Popover>
                  </div>
                  <span className="text-xs font-semibold text-foreground">{metric.score}/100</span>
                </div>
                <Progress value={metric.score} className={`h-1.5 [&>div]:${getScoreColor(metric.score)}`} />
              </div>
            </React.Fragment>
          ) : null
        ))}
      </CardContent>
    </Card>
  );
}
