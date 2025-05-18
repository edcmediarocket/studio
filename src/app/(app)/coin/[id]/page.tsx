
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
import { ArrowLeft, AlertTriangle, ExternalLink, Globe, Users, BookOpen, TrendingUp, TrendingDown, Package, RefreshCw } from 'lucide-react';
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';

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

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; className?: string }> = ({ title, icon, children, className }) => (
  <Card className={cn("shadow-lg", className)}>
    <CardHeader>
      <CardTitle className="flex items-center text-xl text-primary">
        {icon}
        <span className="ml-2">{title}</span>
      </CardTitle>
    </CardHeader>
    <CardContent>{children}</CardContent>
  </Card>
);

const StatItem: React.FC<{ label: string; value: string | number | undefined | null; unit?: string; isPercentage?: boolean; className?: string }> = ({ label, value, unit, isPercentage, className }) => {
  const displayValue = useMemo(() => {
    if (value === null || typeof value === 'undefined') return 'N/A';
    if (typeof value === 'number') {
      if (isPercentage) return `${value.toFixed(2)}%`;
      return unit === '$' ? `${unit}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: value > 1 ? 2 : 8 })}` : `${value.toLocaleString()} ${unit || ''}`.trim();
    }
    return value;
  }, [value, unit, isPercentage]);

  const valueColor = isPercentage && typeof value === 'number' ? (value >= 0 ? 'text-green-400' : 'text-red-400') : 'text-foreground';

  return (
    <div className={cn("flex justify-between py-2 border-b border-muted/50 last:border-b-0", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${valueColor}`}>{displayValue}</span>
    </div>
  );
};


export default function CoinDetailPage() {
  const params = useParams();
  const coinId = params.id as string;

  const [coinDetail, setCoinDetail] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-8 w-32 mb-4" /> {/* Back button */}
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-5 w-32" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="shadow-lg">
            <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, j) => <Skeleton key={j} className="h-5 w-full" />)}
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

  // Sanitize description (very basic, consider a library for robust sanitization)
  const cleanDescription = description.en?.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" class="text-primary hover:underline" ');


  return (
    <div className="space-y-6">
      <Button variant="outline" asChild className="mb-0 md:mb-2">
        <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
      </Button>

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-card/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            <Image src={image.large || 'https://placehold.co/128x128.png'} alt={name} width={80} height={80} className="rounded-full border-2 border-primary" data-ai-hint="coin logo crypto"/>
            <div className="flex-grow">
              <CardTitle className="text-2xl sm:text-3xl font-bold text-neon flex items-center">
                {name} <Badge variant="secondary" className="ml-2 text-base sm:text-lg">{symbol.toUpperCase()}</Badge>
              </CardTitle>
              {market_cap_rank && <CardDescription className="text-sm text-muted-foreground">Market Cap Rank: #{market_cap_rank}</CardDescription>}
            </div>
            <div className="text-right">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentPrice > 0.01 ? 2 : 8 })}</p>
              <p className={`text-sm font-semibold ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h.toFixed(2)}% (24h)
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Description" icon={<BookOpen />}>
            {cleanDescription ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
            ) : (
              <p className="text-muted-foreground text-sm">No description available.</p>
            )}
          </SectionCard>

          <SectionCard title="Links" icon={<Globe />}>
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
              {/* Add more links like Twitter, Telegram, Reddit if needed and available */}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-6">
          <SectionCard title="Market Statistics" icon={<TrendingUp />}>
            <StatItem label="Market Cap" value={market_data.market_cap.usd} unit="$" />
            <StatItem label="Total Volume (24h)" value={market_data.total_volume.usd} unit="$" />
            <StatItem label="Circulating Supply" value={market_data.circulating_supply} unit={symbol.toUpperCase()} />
            <StatItem label="Total Supply" value={market_data.total_supply} unit={symbol.toUpperCase()} />
            <StatItem label="Max Supply" value={market_data.max_supply} unit={symbol.toUpperCase()} />
            <StatItem label="24h High" value={market_data.high_24h.usd} unit="$" />
            <StatItem label="24h Low" value={market_data.low_24h.usd} unit="$" />
          </SectionCard>

          <SectionCard title="Price Performance" icon={<RefreshCw />}>
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
