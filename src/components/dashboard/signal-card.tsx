
"use client";

import React from 'react'; // Import React for React.memo
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, Star, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export interface SignalCardProps { // Exporting the interface
  coinName: string;
  signal: "Buy" | "Sell" | "Hold";
  confidence: number; // 0-100
  timeframe: string;
  riskLevel: "Low" | "Medium" | "High";
  lastUpdate: string; // e.g., "5m ago" or a timestamp
  details: string;
}

const SignalCardComponent: React.FC<SignalCardProps> = ({ coinName, signal, confidence, timeframe, riskLevel, lastUpdate, details }) => {
  const signalColor = signal === "Buy" ? "text-green-400" : signal === "Sell" ? "text-red-400" : "text-yellow-400";
  const signalIcon = signal === "Buy" ? <TrendingUp className={`mr-2 ${signalColor}`} /> : signal === "Sell" ? <TrendingDown className={`mr-2 ${signalColor}`} /> : <AlertTriangle className={`mr-2 ${signalColor}`} />;
  
  const riskColor = riskLevel === "Low" ? "bg-green-500" : riskLevel === "Medium" ? "bg-yellow-500" : "bg-red-500";

  const confidenceStars = Math.round(confidence / 20); // Max 5 stars

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-primary">{coinName}</CardTitle>
            <CardDescription className="text-xs text-muted-foreground">{timeframe} Projection</CardDescription>
          </div>
          <Badge variant={signal === "Buy" ? "default" : signal === "Sell" ? "destructive" : "secondary"} className={`${signalColor} bg-opacity-20 border-opacity-50 ${signal === "Buy" ? "border-green-400" : signal === "Sell" ? "border-red-400" : "border-yellow-400"}`}>
            {signalIcon}
            {signal}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-foreground">Confidence:</span>
            <div className="flex items-center">
              {Array(5).fill(0).map((_, i) => (
                <Star key={i} className={`h-4 w-4 ${i < confidenceStars ? 'text-neon fill-neon' : 'text-muted-foreground'}`} />
              ))}
            </div>
          </div>
          <Progress value={confidence} className="h-2 [&>div]:bg-neon" />
        </div>
        
        <p className="text-sm text-muted-foreground">{details}</p>

        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center">
            <span className="mr-1">Risk:</span>
            <Badge className={`px-2 py-0.5 text-xs ${riskColor} text-white`}>{riskLevel}</Badge>
          </div>
          <div className="flex items-center">
            <Clock className="mr-1 h-3 w-3" />
            <span>{lastUpdate}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
         {/* Potential actions like "Trade Now" or "More Info" */}
      </CardFooter>
    </Card>
  );
}

export const SignalCard = React.memo(SignalCardComponent);
    
