
"use client";

import { SentimentAnalysisCard } from "@/components/analysis/sentiment-analysis-card";
import { PriceTrendAnalysisCard } from "@/components/analysis/price-trend-analysis-card"; // New
import { WhaleMovementAnalysisCard } from "@/components/analysis/whale-movement-analysis-card"; // New
import { AnalysisChart } from "@/components/analysis/analysis-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChartHorizontalBig, Users, ShieldAlert } from "lucide-react"; // Users as placeholder for Whale

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <BarChartHorizontalBig className="mr-3 h-8 w-8" /> AI Analysis Dashboard
        </h1>
        <p className="text-lg text-muted-foreground">
          Dive deep into meme coin analytics with AI-powered insights.
        </p>
      </div>

      {/* First Row: Sentiment Analysis */}
      <SentimentAnalysisCard />

      {/* Second Row: Price Trend and Whale Movement Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceTrendAnalysisCard />
        <WhaleMovementAnalysisCard />
      </div>
      
      {/* Third Row: Placeholder Charts (Can be enhanced later) */}
      <h2 className="text-2xl font-semibold text-primary pt-4">Conceptual Data Visualizations</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <AnalysisChart 
            title="Price Trends (Conceptual)" 
            description="Placeholder: Visualizing predicted price movements against actual market data. AI textual analysis above provides insights."
          />
          <AnalysisChart 
            title="Whale Movements (Conceptual)" 
            description="Placeholder: Tracking significant transactions and their potential market impact. AI textual analysis above provides insights."
            chartType="bar"
          />
      </div>

      <Card className="shadow-lg mt-8">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-primary">
            <ShieldAlert className="mr-2 h-6 w-6" /> Real-time Whale Activity Alerts
          </CardTitle>
          <CardDescription>
            (Feature Coming Soon) Real-time notifications on significant whale transactions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will display alerts from services like Whale Alert API, providing insights into large token movements that could affect market prices. Stay tuned for this powerful feature!
          </CardContent>
        </Card>
    </div>
  );
}
