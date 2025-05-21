
"use client";

import React from 'react'; // Import React
import Link from 'next/link';
import type { GetSignalOfTheDayOutput } from "@/ai/flows/get-signal-of-the-day";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Info, TrendingUp, TrendingDown, Zap, Sparkles, HelpCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface SignalOfTheDayCardProps {
  signalData: GetSignalOfTheDayOutput | null;
  loading: boolean;
  error: string | null;
  onRefresh?: () => void;
}

const SignalOfTheDayCardComponent: React.FC<SignalOfTheDayCardProps> = ({ signalData, loading, error, onRefresh }) => {
  if (loading) {
    return (
      <Card className="shadow-xl border-2 border-neon/70 animate-pulse">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center text-neon">
            <Sparkles className="mr-2 h-5 w-5 animate-ping opacity-75" /> AI Signal of the Day
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">Fetching the latest insight...</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin text-primary mx-auto" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg border-destructive">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center text-destructive">
            <AlertTriangle className="mr-2 h-5 w-5" /> Signal Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive-foreground text-sm sm:text-base">{error}</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="destructive" size="sm" className="mt-3">
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  if (!signalData) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl flex items-center text-primary">
            <Sparkles className="mr-2 h-5 w-5" /> AI Signal of the Day
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground text-sm sm:text-base">No signal available at the moment.</p>
          {onRefresh && (
            <Button onClick={onRefresh} variant="outline" size="sm" className="mt-3">
              Refresh
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const getSignalBadgeClasses = (signal: "Buy" | "Sell" | "Hold") => {
    if (signal === "Buy") return "bg-green-500/20 text-green-400 border-green-500/50";
    if (signal === "Sell") return "bg-red-500/20 text-red-400 border-red-500/50";
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/50";
  };

  return (
    <Card className="shadow-xl border-2 border-neon/70 hover:shadow-neon/30 transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg sm:text-xl flex items-center text-neon">
            <Sparkles className="mr-2 h-5 w-5" /> AI Signal of the Day
          </CardTitle>
          <Link href={`/coin/${signalData.coinName.toLowerCase().replace(/\s+/g, '-')}`} passHref>
            <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-neon">
              View {signalData.symbol.toUpperCase()}
            </Button>
          </Link>
        </div>
        <CardDescription className="text-xs sm:text-sm">
          Today's top AI-curated insight. Generated {formatDistanceToNow(new Date(signalData.generatedAt), { addSuffix: true })}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="text-center space-y-1">
          <p className="text-xl sm:text-2xl font-bold text-foreground">
            {signalData.coinName} <span className="text-lg sm:text-xl text-muted-foreground">({signalData.symbol.toUpperCase()})</span>
          </p>
          <Badge variant="outline" className={cn("text-lg sm:text-xl px-4 py-1.5 font-semibold", getSignalBadgeClasses(signalData.signal))}>
            {signalData.signal === "Buy" && <TrendingUp className="mr-1.5 h-5 w-5" />}
            {signalData.signal === "Sell" && <TrendingDown className="mr-1.5 h-5 w-5" />}
            {signalData.signal === "Hold" && <HelpCircle className="mr-1.5 h-5 w-5" />}
            {signalData.signal}
          </Badge>
        </div>

        <div>
          <p className="text-sm sm:text-base text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{signalData.briefRationale}</p>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1 text-xs sm:text-sm">
            <span className="font-medium text-muted-foreground">AI Confidence:</span>
            <span className="font-semibold text-neon">{signalData.confidenceScore}%</span>
          </div>
          <Progress value={signalData.confidenceScore} className="h-2 sm:h-2.5 [&>div]:bg-neon" />
        </div>
      </CardContent>
      <CardFooter className="pt-3 sm:pt-4">
        <p className="text-xs text-muted-foreground">{signalData.disclaimer}</p>
      </CardFooter>
    </Card>
  );
}

export const SignalOfTheDayCard = React.memo(SignalOfTheDayCardComponent);
