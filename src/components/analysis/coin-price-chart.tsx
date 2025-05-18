
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Loader2, AlertTriangle, BarChartHorizontalBig } from "lucide-react";
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
      <Card className="shadow-lg min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading price chart for {coinName}...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="shadow-lg min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
        <CardContent className="text-center">
          <AlertTriangle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle className="text-destructive mb-2">Chart Error</CardTitle>
          <CardDescription className="text-destructive-foreground max-w-md mx-auto">{error}</CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (!coinName || data.length === 0) {
    return (
       <Card className="shadow-lg min-h-[300px] sm:min-h-[400px] flex items-center justify-center">
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

  const hasVerySmallPrices = data.some(d => d.close < 0.01 && d.close !== 0);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl text-primary">Price Chart: {coinName}</CardTitle>
        <CardDescription>Closing prices over the last 30 days (USD).</CardDescription>
      </CardHeader>
      <CardContent className="h-[50vh] sm:h-[400px] p-0"> {/* Changed padding to p-0 */}
        <ChartContainer config={chartConfig} className="w-full h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={formattedData}
              margin={{
                top: 5,
                right: 10, // Increased right margin
                left: 5,  // Increased left margin slightly
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
                fontSize={10}
                interval="preserveStartEnd" // Reduce tick density
                // Or use a number e.g. interval={Math.floor(formattedData.length / 5)} to show ~5 ticks
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => {
                    const numValue = Number(value);
                    if (isNaN(numValue)) return '$--';
                    const fixedDigits = hasVerySmallPrices ? (numValue === 0 ? 2 : 6) : (numValue < 1 && numValue !== 0 ? 4 : 2);
                    return `$${numValue.toFixed(fixedDigits)}`;
                }}
                domain={['auto', 'auto']}
                width={55} // Reduced YAxis width
                fontSize={10}
              />
              <Tooltip
                content={<ChartTooltipContent
                            indicator="dot"
                            formatter={(value, name) => {
                                const numValue = Number(value);
                                if (name === 'price') {
                                    return [`$${numValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: numValue < 0.01 && numValue !== 0 ? 8 : 2})}`, name];
                                }
                                return [numValue.toLocaleString(), name];
                            }}
                            cursorStyle={{ stroke: 'hsl(var(--neon-accent-hsl))', strokeWidth: 2 }}
                        />}
                wrapperStyle={{ outline: "none" }}
              />
              <Legend wrapperStyle={{fontSize: "12px"}}/>
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
