
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, AlertTriangle } from "lucide-react";
import { format } from 'date-fns';

export interface OhlcData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CoinPriceChartProps {
  coinName: string | null;
  data: OhlcData[];
  loading: boolean;
  error: string | null;
}

export function CoinPriceChart({ coinName, data, loading, error }: CoinPriceChartProps) {
  if (loading) {
    return (
      <Card className="shadow-lg min-h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading price chart for {coinName}...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg min-h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-destructive mb-2">Chart Error</CardTitle>
          <CardDescription className="text-destructive-foreground">{error}</CardDescription>
          <p className="text-xs text-muted-foreground mt-2">Try a different coin ID or check CoinGecko for availability.</p>
        </CardContent>
      </Card>
    );
  }

  if (!coinName || data.length === 0) {
    return (
       <Card className="shadow-lg min-h-[400px] flex items-center justify-center">
         <CardContent className="text-center">
            <BarChartHorizontalBig className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Price chart will appear here once a coin is selected and data is fetched.</p>
         </CardContent>
       </Card>
    );
  }

  const chartConfig = {
    price: {
      label: "Price (USD)",
      color: "hsl(var(--neon-accent-hsl))",
    },
  };

  const formattedData = data.map(item => ({
    date: format(new Date(item.timestamp), 'MMM dd'),
    price: item.close,
  }));

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Price Chart: {coinName}</CardTitle>
        <CardDescription>Closing prices over the last 30 days (USD).</CardDescription>
      </CardHeader>
      <CardContent className="h-[400px] p-0 sm:p-2 md:p-4">
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 20, // Increased right margin for Y-axis labels
                left: 10, // Increased left margin for Y-axis labels
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                dy={5}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                domain={['auto', 'auto']}
                width={80} // Explicit width for Y-axis to prevent label cutoff
              />
              <Tooltip
                content={<ChartTooltipContent 
                            indicator="dot" 
                            formatter={(value, name) => [`$${Number(value).toFixed(2)}`, name]}
                            cursorStyle={{ stroke: 'hsl(var(--neon-accent-hsl))', strokeWidth: 2 }}
                        />}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="price"
                stroke="var(--color-price)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, style: { fill: "var(--color-price)", stroke: "hsl(var(--background))" } }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

// Added BarChartHorizontalBig for placeholder state
import { BarChartHorizontalBig } from "lucide-react";
