"use client";

import { SentimentAnalysisCard } from "@/components/analysis/sentiment-analysis-card";
import { AnalysisChart } from "@/components/analysis/analysis-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2">AI Analysis Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Dive deep into meme coin analytics with AI-powered insights.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SentimentAnalysisCard />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <AnalysisChart 
            title="Price Trends (Predicted vs Actual)" 
            description="Placeholder: Visualizing predicted price movements against actual market data."
          />
          <AnalysisChart 
            title="Whale Movements" 
            description="Placeholder: Tracking significant transactions and their potential market impact."
            chartType="bar" // Example of different chart type or config
          />
        </div>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-primary">
            <ShieldAlert className="mr-2 h-6 w-6" /> Whale Activity Alerts
          </CardTitle>
          <CardDescription>
            Real-time notifications on significant whale transactions (Feature Coming Soon).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will display alerts from services like Whale Alert API, providing insights into large token movements that could affect market prices. Stay tuned for this powerful feature!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
