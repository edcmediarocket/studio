
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";

export function OnChainDataVisualizer() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl text-primary">
          <Activity className="mr-2 h-6 w-6" /> On-Chain Data Visualization
        </CardTitle>
        <CardDescription>
          Visualize real-time blockchain data for meme coins (Feature Coming Soon).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-muted-foreground/50 rounded-lg p-6 text-center bg-card/50">
          <Activity className="h-16 w-16 text-primary mb-4" />
          <p className="text-muted-foreground text-lg mb-2">
            Dive deep into blockchain activity! This upcoming feature will provide tools for visualizing on-chain metrics such as:
          </p>
          <ul className="list-disc list-inside text-muted-foreground text-sm space-y-1 mb-4">
            <li>Holder Distribution</li>
            <li>Transaction Volume & Patterns</li>
            <li>Smart Contract Interactions</li>
            <li>Token Flow Analysis</li>
          </ul>
          <p className="text-neon font-semibold mt-2 text-xl">
            Stay Tuned for Powerful On-Chain Insights!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
