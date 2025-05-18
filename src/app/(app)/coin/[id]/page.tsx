
"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, ExternalLink, Globe, Users, BookOpen, TrendingUp, TrendingDown, Package, RefreshCw, Rocket, BrainCircuit, Loader2, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { getCoinTradingSignal, type GetCoinTradingSignalOutput } from '@/ai/flows/get-coin-trading-signal';
import { cn } from '@/lib/utils';

interface CoinDetail {
  id: string;
  symbol: string;
  name: string;
  image: { thumb: string; small: string; large: string };
  description: { en: string };
  market_cap_rank: number;
  links: {
    homepage: string[];
    blockchain_site: string[];
    official_forum_url: string[];
    twitter_screen_name?: string;
    facebook_username?: string;
    telegram_channel_identifier?: string;
    subreddit_url?: string;
  };
  market_data: {
    current_price: { [currency: string]: number };
    market_cap: { [currency: string]: number };
    total_volume: { [currency: string]: number };
    price_change_percentage_24h_in_currency: { [currency: string]: number };
    price_change_percentage_7d_in_currency: { [currency: string]: number };
    price_change_percentage_30d_in_currency: { [currency: string]: number };
    price_change_percentage_1y_in_currency: { [currency: string]: number };
    high_24h: { [currency: string]: number };
    low_24h: { [currency: string]: number };
    circulating_supply: number;
    total_supply: number | null;
    max_supply: number | null;
  };
}

const SectionCard: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ title, icon, children, className, noPadding }) => (
  <Card className={cn("shadow-lg", className)}>
    <CardHeader>
      <CardTitle className="flex items-center text-xl text-primary">
        {icon}
        <span className={cn(icon && "ml-2")}>{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent className={cn(noPadding ? "p-0" : "", "text-sm")}>{children}</CardContent>
  </Card>
);

const StatItem: React.FC<{ label: string; value: string | number | undefined | null; unit?: string; isPercentage?: boolean; className?: string; valueClassName?: string }> = ({ label, value, unit, isPercentage, className, valueClassName }) => {
  const displayValue = useMemo(() => {
    if (value === null || typeof value === 'undefined') return 'N/A';
    if (typeof value === 'number') {
      if (isPercentage) return `${value.toFixed(2)}%`;
      return unit === '$' ? `${unit}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: value > 1 ? 2 : 8 })}` : `${value.toLocaleString()} ${unit || ''}`.trim();
    }
    return value;
  }, [value, unit, isPercentage]);

  const defaultValueColor = isPercentage && typeof value === 'number' ? (value >= 0 ? 'text-green-400' : 'text-red-400') : 'text-foreground';

  return (
    <div className={cn("flex justify-between py-2.5 px-4 border-b border-muted/30 last:border-b-0 items-center", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold", valueClassName || defaultValueColor)}>{displayValue}</span>
    </div>
  );
};

const RocketScoreDisplay: React.FC<{ score: number }> = ({ score }) => (
  <div className="flex">
    {Array.from({ length: 5 }).map((_, i) => (
      <Rocket
        key={i}
        className={cn("h-5 w-5", i < score ? "text-neon fill-neon" : "text-muted-foreground/50")}
      />
    ))}
  </div>
);

export default function CoinDetailPage() {
  const params = useParams();
  const coinId = params.id as string;

  const [coinDetail, setCoinDetail] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tradingSignal, setTradingSignal] = useState<GetCoinTradingSignalOutput | null>(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalError, setSignalError] = useState<string | null>(null);

  useEffect(() => {
    if (!coinId) return;

    const fetchCoinDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch coin data: ${response.statusText}`);
        }
        const data = await response.json();
        setCoinDetail(data);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCoinDetail();
  }, [coinId]);

  useEffect(() => {
    if (coinDetail?.name) {
      const fetchTradingSignal = async () => {
        setSignalLoading(true);
        setSignalError(null);
        try {
          const signal = await getCoinTradingSignal({ coinName: coinDetail.name });
          setTradingSignal(signal);
        } catch (err) {
          console.error("Error fetching trading signal:", err);
          setSignalError("Failed to fetch AI trading signal. Please try again later.");
        } finally {
          setSignalLoading(false);
        }
      };
      fetchTradingSignal();
    }
  }, [coinDetail?.name]);


  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-8 w-32 mb-4" /> {/* Back button */}
        <div className="p-4 bg-card rounded-lg shadow-lg">
          <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="flex-grow">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-24 mt-1" />
            </div>
            <div className="text-right">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-5 w-20 mt-1" />
            </div>
          </div>
        </div>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-3">
              {[...Array(3)].map((_, j) => <Skeleton key={j} className="h-5 w-full" />)}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Button variant="outline" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!coinDetail) {
    return (
      <div className="p-4">
         <Button variant="outline" asChild className="mb-4">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
        <p className="text-center text-muted-foreground">Coin data not found.</p>
      </div>
    );
  }

  const { name, symbol, image, market_data, description, links, market_cap_rank } = coinDetail;
  const currentPrice = market_data.current_price.usd;
  const priceChange24h = market_data.price_change_percentage_24h_in_currency.usd;

  const cleanDescription = description.en?.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" class="text-primary hover:underline" ');

  const getRecommendationBadgeVariant = (recommendation?: 'Buy' | 'Sell' | 'Hold') => {
    if (recommendation === 'Buy') return 'default'; 
    if (recommendation === 'Sell') return 'destructive';
    if (recommendation === 'Hold') return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button variant="outline" asChild className="mb-0 md:mb-2">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>
      
      <div className="p-4 bg-card rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Image src={image.large || 'https://placehold.co/128x128.png'} alt={name} width={64} height={64} className="rounded-full border-2 border-primary" data-ai-hint="coin logo crypto"/>
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-neon flex items-center justify-center sm:justify-start">
                {name} <Badge variant="secondary" className="ml-2 text-base sm:text-lg">{symbol.toUpperCase()}</Badge>
              </h1>
              {market_cap_rank && <p className="text-sm text-muted-foreground">Market Cap Rank: #{market_cap_rank}</p>}
            </div>
            <div className="text-center sm:text-right">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentPrice > 0.01 ? 2 : 8 })}</p>
              <p className={`text-base font-semibold ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h.toFixed(2)}% (24h)
              </p>
            </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-primary">
                    <BrainCircuit className="mr-2 h-5 w-5"/>AI Trading Signal
                </CardTitle>
            </CardHeader>
            <CardContent>
                {signalLoading && (
                  <div className="space-y-3 py-4">
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <p className="ml-2 text-muted-foreground">Fetching AI Signal...</p>
                    </div>
                    <Skeleton className="h-5 w-1/4 mx-auto" /> 
                    <Skeleton className="h-4 w-1/2 mx-auto" /> 
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                )}
                {signalError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Signal Error</AlertTitle>
                    <AlertDescription>{signalError}</AlertDescription>
                  </Alert>
                )}
                {tradingSignal && !signalLoading && !signalError && (
                  <div className="space-y-3">
                    <div className="flex flex-col items-center space-y-2 border-b border-muted/30 pb-3 mb-3">
                      <Badge variant={getRecommendationBadgeVariant(tradingSignal.recommendation)} className="text-lg px-4 py-1">
                        {tradingSignal.recommendation}
                      </Badge>
                      <RocketScoreDisplay score={tradingSignal.rocketScore} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Reasoning:</p>
                      <p className="text-sm text-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{tradingSignal.reasoning}</p>
                    </div>
                    <p className="text-xs text-muted-foreground pt-2 border-t border-muted/30 mt-3">{tradingSignal.disclaimer}</p>
                  </div>
                )}
            </CardContent>
          </Card>

          <SectionCard title="Description" icon={<BookOpen className="h-5 w-5"/>}>
            {cleanDescription ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
            ) : (
              <p className="text-muted-foreground text-sm">No description available.</p>
            )}
          </SectionCard>

          <SectionCard title="Links" icon={<Globe className="h-5 w-5"/>}>
            <div className="space-y-2">
              {links.homepage?.[0] && (
                <Button variant="link" asChild className="p-0 h-auto justify-start text-sm">
                  <a href={links.homepage[0]} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> Official Website <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              {links.blockchain_site?.[0] && (
                 <Button variant="link" asChild className="p-0 h-auto justify-start text-sm">
                  <a href={links.blockchain_site[0]} target="_blank" rel="noopener noreferrer">
                    <Package className="mr-2 h-4 w-4" /> Blockchain Explorer <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
               {links.twitter_screen_name && (
                 <Button variant="link" asChild className="p-0 h-auto justify-start text-sm">
                  <a href={`https://twitter.com/${links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.32 4.507 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></svg>
                    Twitter <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
               {links.telegram_channel_identifier && (
                 <Button variant="link" asChild className="p-0 h-auto justify-start text-sm">
                  <a href={`https://t.me/${links.telegram_channel_identifier}`} target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23c.07-.99-.46-1.4-1.02-1.8l-2.4-1.6c-.57-.38-.84-.9-.58-1.5.27-.62.9-.9 1.55-.75l11.07 4.3c.66.26.97.88.8 1.5-.17.63-.8 1-1.52.75l-3.6-1.7c-.64-.3-1.42.17-1.32 1.07l.3 3.5c.05.6-.2 1.18-.7 1.5s-1.18.35-1.75-.04L9.78 18.65z"></path></svg>
                    Telegram <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Market Statistics" noPadding>
            <StatItem label="Market Cap" value={market_data.market_cap.usd} unit="$" />
            <StatItem label="Total Volume (24h)" value={market_data.total_volume.usd} unit="$" />
            <StatItem label="Circulating Supply" value={market_data.circulating_supply} unit={symbol.toUpperCase()} />
            <StatItem label="Total Supply" value={market_data.total_supply} unit={symbol.toUpperCase()} />
            <StatItem label="Max Supply" value={market_data.max_supply} unit={symbol.toUpperCase()} />
            <StatItem label="24h High" value={market_data.high_24h.usd} unit="$" />
            <StatItem label="24h Low" value={market_data.low_24h.usd} unit="$" />
          </SectionCard>

          <SectionCard title="Price Performance" noPadding>
            <StatItem label="24 Hours" value={market_data.price_change_percentage_24h_in_currency.usd} isPercentage />
            <StatItem label="7 Days" value={market_data.price_change_percentage_7d_in_currency.usd} isPercentage />
            <StatItem label="30 Days" value={market_data.price_change_percentage_30d_in_currency.usd} isPercentage />
            <StatItem label="1 Year" value={market_data.price_change_percentage_1y_in_currency.usd} isPercentage />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

