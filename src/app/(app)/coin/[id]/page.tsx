
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, ExternalLink, Globe, Users, BookOpen, TrendingUp, TrendingDown, Package, RefreshCw, Rocket, BrainCircuit, Loader2, Info, Target, ShieldCheck, HelpCircle, Briefcase, ShieldAlert as RiskIcon, ListChecks, Zap, ClockIcon, Sparkles as ViralityIcon, Siren, Hourglass, TrendingUpIcon, TrendingDownIcon, BarChartBig, ActivityIcon, UsersIcon, FileTextIcon, Layers, Dna, MapPin, FileJson, KeyRound, ShieldQuestion as AuditIcon, UsersRound, MessageSquare, CalendarClock, MinusCircle } from 'lucide-react'; // Added MinusCircle
import { Table, TableBody, TableCell, TableRow, TableHead, TableHeader } from '@/components/ui/table';
import { getCoinTradingSignal, type GetCoinTradingSignalOutput } from '@/ai/flows/get-coin-trading-signal';
import { getCoinRiskAssessment, type GetCoinRiskAssessmentOutput } from '@/ai/flows/get-coin-risk-assessment';
import { getViralPrediction, type GetViralPredictionOutput } from '@/ai/flows/get-viral-prediction';
import { getMemeCoinLifespanPrediction, type GetMemeCoinLifespanPredictionOutput } from '@/ai/flows/get-meme-coin-lifespan-prediction';
import { getSimulatedSignalPerformance, type GetSimulatedSignalPerformanceOutput } from '@/ai/flows/get-simulated-signal-performance';
import { getEntryZoneStatus, type GetEntryZoneStatusOutput } from '@/ai/flows/get-entry-zone-status';
import { getConceptualTokenomicsAnalysis, type GetConceptualTokenomicsAnalysisOutput } from '@/ai/flows/get-conceptual-tokenomics-analysis';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import * as AccordionPrimitive from "@radix-ui/react-accordion"
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { StatItem } from '@/components/shared/stat-item';
import { TokenDnaStrip } from '@/components/shared/token-dna-strip';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Progress } from '@/components/ui/progress';


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

interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  titleClassName?: string;
  infoPopoverContent?: React.ReactNode;
  defaultOpenAccordion?: boolean;
}

const SectionCardComponent: React.FC<SectionCardProps> = ({ title, icon, children, className, noPadding, titleClassName, infoPopoverContent, defaultOpenAccordion = false }) => {
  if (title === "Tokenomics Blueprint") {
    return (
      <Card className={cn("shadow-lg", className)}>
        <Accordion type="single" collapsible className="w-full" defaultValue={defaultOpenAccordion ? "item-1" : undefined}>
          <AccordionItem value="item-1" className="border-b-0">
            <AccordionPrimitive.Header className={cn("flex items-center justify-between", noPadding ? "p-0" : "px-4")}>
              <AccordionTrigger className={cn(noPadding ? "py-3" : "py-4", "hover:no-underline flex-grow p-0")}>
                <div className={cn("flex items-center text-xl text-primary font-semibold", titleClassName)}>
                  {icon}
                  <span className={cn(icon && "ml-2")}>{title}</span>
                </div>
              </AccordionTrigger>
              {infoPopoverContent && (
                <div className="ml-2 flex-shrink-0">
                  <Popover>
                      <PopoverTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()}>
                          <Info className="h-4 w-4" />
                      </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 text-sm">
                      {infoPopoverContent}
                      </PopoverContent>
                  </Popover>
                </div>
                )}
            </AccordionPrimitive.Header>
            <AccordionContent className={cn("text-sm", noPadding ? "p-0" : "px-4 pb-4")}>
              {children}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-lg", className)}>
      <CardHeader className={cn(noPadding ? "pb-2 pt-4 px-4" : "pb-3", "flex flex-row justify-between items-center")}>
        <div className={cn("flex items-center text-xl text-primary font-semibold", titleClassName)}>
          {icon}
          <span className={cn(icon && "ml-2")}>{title}</span>
        </div>
        {infoPopoverContent && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 ml-2 text-muted-foreground hover:text-foreground">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm">
              {infoPopoverContent}
            </PopoverContent>
          </Popover>
        )}
      </CardHeader>
      <CardContent className={cn(noPadding ? "p-0" : "text-sm", noPadding && "px-4 pb-4")}>{children}</CardContent>
    </Card>
  );
};
const SectionCard = React.memo(SectionCardComponent);


const TradingTargetLabel: React.FC<{ label: string; tooltip: string }> = ({ label, tooltip }) => (
  <div className="flex items-center">
    <span>{label}</span>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-5 w-5 ml-1.5 text-muted-foreground hover:text-foreground">
          <HelpCircle className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 text-xs p-2">
        {tooltip}
      </PopoverContent>
    </Popover>
  </div>
);

const FactorImpactIcon: React.FC<{ impact: "Positive" | "Negative" | "Neutral" }> = ({ impact }) => {
  if (impact === "Positive") return <TrendingUpIcon className="h-4 w-4 text-green-500 mx-auto" />;
  if (impact === "Negative") return <TrendingDownIcon className="h-4 w-4 text-red-500 mx-auto" />;
  return <MinusCircle className="h-4 w-4 text-yellow-500 mx-auto" />;
};

export default function CoinDetailPage() {
  const params = useParams();
  const coinId = params.id as string;

  const [coinDetail, setCoinDetail] = useState<CoinDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tradingSignal, setTradingSignal] = useState<GetCoinTradingSignalOutput | null>(null);
  const [signalLoading, setSignalLoading] = useState(false);
  const [signalError, setSignalError] = useState<string | null>(null);

  const [riskAssessment, setRiskAssessment] = useState<GetCoinRiskAssessmentOutput | null>(null);
  const [riskLoading, setRiskLoading] = useState(false);
  const [riskError, setRiskError] = useState<string | null>(null);

  const [viralPrediction, setViralPrediction] = useState<GetViralPredictionOutput | null>(null);
  const [viralPredictionLoading, setViralPredictionLoading] = useState(false);
  const [viralPredictionError, setViralPredictionError] = useState<string | null>(null);

  const [lifespanPrediction, setLifespanPrediction] = useState<GetMemeCoinLifespanPredictionOutput | null>(null);
  const [lifespanLoading, setLifespanLoading] = useState(false);
  const [lifespanError, setLifespanError] = useState<string | null>(null);

  const [signalPerformance, setSignalPerformance] = useState<GetSimulatedSignalPerformanceOutput | null>(null);
  const [performanceLoading, setPerformanceLoading] = useState(false);
  const [performanceError, setPerformanceError] = useState<string | null>(null);

  const [entryZoneStatus, setEntryZoneStatus] = useState<GetEntryZoneStatusOutput | null>(null);
  const [entryZoneLoading, setEntryZoneLoading] = useState(false);
  const [entryZoneError, setEntryZoneError] = useState<string | null>(null);

  const [tokenomicsAnalysis, setTokenomicsAnalysis] = useState<GetConceptualTokenomicsAnalysisOutput | null>(null);
  const [tokenomicsLoading, setTokenomicsLoading] = useState(false);
  const [tokenomicsError, setTokenomicsError] = useState<string | null>(null);


  useEffect(() => {
    if (!coinId) return;

    const fetchAllCoinData = async () => {
      setLoading(true);
      setSignalLoading(true);
      setRiskLoading(true);
      setViralPredictionLoading(true);
      setLifespanLoading(true);
      setPerformanceLoading(true);
      setEntryZoneLoading(true);
      setTokenomicsLoading(true);

      setError(null);
      setSignalError(null);
      setRiskError(null);
      setViralPredictionError(null);
      setLifespanError(null);
      setPerformanceError(null);
      setEntryZoneError(null);
      setTokenomicsError(null);
      setCoinDetail(null); 

      try {
        const detailResponse = await fetch(`https://api.coingecko.com/api/v3/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
        if (!detailResponse.ok) {
          const errorData = await detailResponse.json().catch(() => ({ error: "Failed to parse error response" }));
          const errorMessage = errorData.error || `Failed to fetch coin data: ${detailResponse.statusText}. Please check the coin ID.`;
          console.warn(`CoinGecko API error for ${coinId}:`, errorMessage);
          setError(errorMessage); 
          setLoading(false); 
          setSignalLoading(false);
          setRiskLoading(false);
          setViralPredictionLoading(false);
          setLifespanLoading(false);
          setPerformanceLoading(false);
          setEntryZoneLoading(false);
          setTokenomicsLoading(false);
          return;
        }
        const detailData = await detailResponse.json();
        setCoinDetail(detailData);
        setLoading(false);

        if (detailData?.name) {
          const currentPriceUSD = detailData.market_data?.current_price?.usd;
          const currentMarketCapUSD = detailData.market_data?.market_cap?.usd;

          // Trading Signal
          if (currentPriceUSD !== undefined) {
            try {
              const signal = await getCoinTradingSignal({
                coinName: detailData.name,
                currentPriceUSD: currentPriceUSD,
              });
              setTradingSignal(signal);
            } catch (err: any) {
              console.error("Error fetching trading signal:", err);
              let errorMsg = err.message || "An unknown error occurred";
              if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('networkerror')) {
                errorMsg = "Network error: Failed to fetch AI trading signal. Please check your connection.";
              } else if (errorMsg.toLowerCase().includes('503') || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('service unavailable')) {
                errorMsg = "AI service for trading signals is temporarily overloaded or unavailable. Please try again later.";
              } else {
                errorMsg = `Failed to fetch AI trading signal for ${detailData.name}. Please try again later. Details: ${errorMsg}`;
              }
              setSignalError(errorMsg);
            } finally {
              setSignalLoading(false);
            }
          } else {
            setSignalLoading(false);
            setSignalError("Current price data missing, cannot generate trading signal.");
          }

          // Risk Assessment
          try {
            const risk = await getCoinRiskAssessment({ coinName: detailData.name });
            setRiskAssessment(risk);
          } catch (err: any) {
            console.error("Error fetching risk assessment:", err);
            let errorMsg = err.message || "An unknown error occurred";
            if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('networkerror')) {
              errorMsg = "Network error: Failed to fetch AI risk assessment. Please check your connection.";
            } else if (errorMsg.toLowerCase().includes('503') || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('service unavailable')) {
                errorMsg = "AI service for risk assessment is temporarily overloaded or unavailable. Please try again later.";
            } else {
              errorMsg = `Failed to fetch AI risk assessment for ${detailData.name}. Please try again later. Details: ${errorMsg}`;
            }
            setRiskError(errorMsg);
          } finally {
            setRiskLoading(false);
          }

          // Viral Prediction
          try {
            const prediction = await getViralPrediction({ coinName: detailData.name });
            setViralPrediction(prediction);
          } catch (err: any) {
            console.error("Error fetching viral prediction:", err);
            let errorMsg = err.message || "An unknown error occurred";
            if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('networkerror')) {
              errorMsg = "Network error: Failed to fetch AI virality prediction. Please check your connection.";
            } else if (errorMsg.toLowerCase().includes('503') || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('service unavailable')) {
              errorMsg = "AI service for virality prediction is temporarily overloaded or unavailable. Please try again later.";
            } else {
              errorMsg = `Failed to fetch AI virality prediction for ${detailData.name}. Please try again later. Details: ${errorMsg}`;
            }
            setViralPredictionError(errorMsg);
          } finally {
            setViralPredictionLoading(false);
          }

          // Lifespan Prediction
          try {
            const lifespan = await getMemeCoinLifespanPrediction({ coinName: detailData.name });
            setLifespanPrediction(lifespan);
          } catch (err: any) {
            console.error("Error fetching lifespan prediction:", err);
            let errorMsg = err.message || "An unknown error occurred";
            if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('networkerror')) {
              errorMsg = "Network error: Failed to fetch AI lifespan prediction. Please check your connection.";
            } else if (errorMsg.toLowerCase().includes('503') || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('service unavailable')) {
              errorMsg = "AI service for lifespan prediction is temporarily overloaded or unavailable. Please try again later.";
            } else {
              errorMsg = `Failed to fetch AI lifespan prediction for ${detailData.name}. Please try again later. Details: ${errorMsg}`;
            }
            setLifespanError(errorMsg);
          } finally {
            setLifespanLoading(false);
          }

          // Simulated Signal Performance
          try {
            const performance = await getSimulatedSignalPerformance({ coinName: detailData.name });
            setSignalPerformance(performance);
          } catch (err: any) {
            console.error("Error fetching signal performance:", err);
            let errorMsg = err.message || "An unknown error occurred";
            if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('networkerror')) {
              errorMsg = "Network error: Failed to fetch AI signal performance. Please check your connection and try again.";
            } else if (errorMsg.toLowerCase().includes('503') || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('service unavailable')) {
              errorMsg = "AI service for signal performance is temporarily overloaded or unavailable. Please try again later.";
            } else {
              errorMsg = `Failed to fetch AI signal performance for ${detailData.name}. Details: ${errorMsg}`;
            }
            setPerformanceError(errorMsg);
          } finally {
            setPerformanceLoading(false);
          }
          
          // Entry Zone Status
          try {
            const status = await getEntryZoneStatus({ 
              coinName: detailData.name,
              currentMarketCap: currentMarketCapUSD,
              currentPrice: currentPriceUSD
            });
            setEntryZoneStatus(status);
          } catch (err: any) {
            console.error("Error fetching entry zone status:", err);
            let errorMsg = err.message || "An unknown error occurred";
            if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('networkerror')) {
              errorMsg = "Network error: Failed to fetch AI Entry Zone Status. Please check your connection.";
            } else if (errorMsg.toLowerCase().includes('503') || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('service unavailable')) {
              errorMsg = "AI service for Entry Zone Status is temporarily overloaded or unavailable. Please try again later.";
            } else {
              errorMsg = `Failed to fetch AI Entry Zone Status for ${detailData.name}. Please try again later. Details: ${errorMsg}`;
            }
            setEntryZoneError(errorMsg);
          } finally {
            setEntryZoneLoading(false);
          }

           // Conceptual Tokenomics Analysis
          try {
            const tokenomics = await getConceptualTokenomicsAnalysis({ coinName: detailData.name });
            setTokenomicsAnalysis(tokenomics);
          } catch (err: any) {
            console.error("Error fetching conceptual tokenomics analysis:", err);
            let errorMsg = err.message || "An unknown error occurred";
            if (errorMsg.toLowerCase().includes('failed to fetch') || errorMsg.toLowerCase().includes('networkerror')) {
              errorMsg = "Network error: Failed to fetch AI tokenomics insights. Please check connection.";
            } else if (errorMsg.toLowerCase().includes('503') || errorMsg.toLowerCase().includes('overloaded') || errorMsg.toLowerCase().includes('service unavailable')) {
              errorMsg = "AI service for tokenomics insights is temporarily overloaded or unavailable. Please try again later.";
            } else {
              errorMsg = `Failed to fetch AI tokenomics insights for ${detailData.name}. Please try again later. Details: ${errorMsg}`;
            }
            setTokenomicsError(errorMsg);
          } finally {
            setTokenomicsLoading(false);
          }


        } else {
          const errorMsg = "Coin name missing from fetched data, cannot proceed with all AI analyses.";
          setSignalError(errorMsg); setSignalLoading(false);
          setRiskError(errorMsg); setRiskLoading(false);
          setViralPredictionError(errorMsg); setViralPredictionLoading(false);
          setLifespanError(errorMsg); setLifespanLoading(false);
          setPerformanceError(errorMsg); setPerformanceLoading(false);
          setEntryZoneError(errorMsg); setEntryZoneLoading(false);
          setTokenomicsError(errorMsg); setTokenomicsLoading(false);
        }

      } catch (err) {
        console.error("Error in fetchAllCoinData catch block:", err);
        let specificError = "An unknown error occurred while fetching coin data.";
        if (err instanceof Error) {
           specificError = err.message;
           if (err instanceof TypeError && err.message.toLowerCase().includes('failed to fetch')) {
             specificError = `Network error: Could not connect to fetch coin data for ${coinId}. Please check your internet connection and try again.`;
           }
        }
        setError(specificError);
        setLoading(false);
        setSignalLoading(false);
        setRiskLoading(false);
        setViralPredictionLoading(false);
        setLifespanLoading(false);
        setPerformanceLoading(false);
        setEntryZoneLoading(false);
        setTokenomicsLoading(false);
      }
    };

    fetchAllCoinData();
  }, [coinId]);


  if (loading && !coinDetail) {
    return (
      <div className="space-y-6 p-4">
        <Skeleton className="h-8 w-32 mb-4" />
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
        {[...Array(7)].map((_, i) => ( 
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
        <p className="text-center text-muted-foreground">Coin data not found for ID: {coinId}. It might be an invalid ID.</p>
      </div>
    );
  }

  const { name, symbol, image, market_data, description: coinDescription, links, market_cap_rank } = coinDetail; 
  const currentPrice = market_data.current_price.usd;
  const priceChange24h = market_data.price_change_percentage_24h_in_currency.usd;

  const cleanDescription = coinDescription.en?.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" class="text-primary hover:underline" ');

  const getRecommendationBadgeVariant = (recommendation?: GetCoinTradingSignalOutput['recommendation']) => {
    if (!recommendation) return 'outline';
    if (recommendation === 'Buy') return 'default';
    if (recommendation === 'Sell') return 'destructive';
    if (recommendation === 'Hold') return 'secondary';
    return 'outline';
  };

  const renderSignalContent = () => {
    if (signalLoading) {
      return (
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground text-lg">Fetching Advanced AI Analysis...</p>
          </div>
          <Skeleton className="h-6 w-1/3 mx-auto" />
          <Skeleton className="h-5 w-1/2 mx-auto" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    if (signalError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Signal Error</AlertTitle>
          <AlertDescription>{signalError}</AlertDescription>
        </Alert>
      );
    }
    if (tradingSignal) {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-2 text-center">
            <Badge variant={getRecommendationBadgeVariant(tradingSignal.recommendation)} className="text-xl px-6 py-2 font-semibold">
              {tradingSignal.recommendation}
            </Badge>
            <p className="text-sm text-muted-foreground">{tradingSignal.reasoning}</p>
            {tradingSignal.confidenceScore !== undefined && (
                 <div className="w-full max-w-xs mx-auto pt-1">
                    <div className="flex justify-between items-center mb-1 text-xs">
                        <span className="font-medium text-muted-foreground">AI Confidence:</span>
                        <span className="font-semibold text-neon">{tradingSignal.confidenceScore}%</span>
                    </div>
                    <Progress value={tradingSignal.confidenceScore} className="h-2 [&>div]:bg-neon" />
                </div>
            )}
          </div>

          <Separator />
          
          {tradingSignal.keyReasoningFactors && tradingSignal.keyReasoningFactors.length > 0 && (
             <div className="mt-4">
                <h4 className="text-md font-semibold text-primary mb-2 flex items-center"><ListChecks className="mr-2 h-5 w-5"/>Key Reasoning Factors</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Factor</TableHead>
                      <TableHead className="text-xs">Observation</TableHead>
                      <TableHead className="text-center text-xs">Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tradingSignal.keyReasoningFactors.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs py-1.5">{item.factor}</TableCell>
                        <TableCell className="text-xs py-1.5">{item.value}</TableCell>
                        <TableCell className="text-center py-1.5">
                          <FactorImpactIcon impact={item.impact} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
          )}


          <div>
            <h4 className="text-md font-semibold text-primary mb-2 flex items-center"><HelpCircle className="mr-2 h-5 w-5"/>Detailed Analysis</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{tradingSignal.detailedAnalysis}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
                 <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><Target className="mr-2 h-5 w-5"/>Future Price Outlook</h4>
                 <StatItem label="Short-Term Target" value={tradingSignal.futurePriceOutlook?.shortTermTarget} className="px-3 py-1.5 bg-muted/30 rounded-t-md border-b-0" labelClassName="text-xs" valueClassName="text-sm"/>
                 <StatItem label="Mid-Term Target" value={tradingSignal.futurePriceOutlook?.midTermTarget} className="px-3 py-1.5 bg-muted/30" labelClassName="text-xs" valueClassName="text-sm"/>
                 <StatItem label="Long-Term Target" value={tradingSignal.futurePriceOutlook?.longTermTarget} className="px-3 py-1.5 bg-muted/30 rounded-b-md" labelClassName="text-xs" valueClassName="text-sm"/>
            </div>
             <div className="space-y-1">
                <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><ShieldCheck className="mr-2 h-5 w-5"/>Trading Targets</h4>
                <StatItem label={<TradingTargetLabel label="Entry Point" tooltip="The suggested price or price range at which to consider buying the coin." />} value={tradingSignal.tradingTargets?.entryPoint} className="px-3 py-1.5 bg-muted/30 rounded-t-md border-b-0" labelClassName="text-xs" valueClassName="text-sm"/>
                <StatItem label={<TradingTargetLabel label="Stop-Loss" tooltip="A pre-set price at which to sell the coin to limit potential losses if the price moves unfavorably." />} value={tradingSignal.tradingTargets.stopLoss} className="px-3 py-1.5 bg-muted/30" labelClassName="text-xs" valueClassName="text-sm"/>
                <StatItem label={<TradingTargetLabel label="Take Profit 1" tooltip="First suggested price level at which to consider selling a portion of your holdings to secure profits." />} value={tradingSignal.tradingTargets.takeProfit1} className="px-3 py-1.5 bg-muted/30" labelClassName="text-xs" valueClassName="text-sm"/>
                {tradingSignal.tradingTargets.takeProfit2 && <StatItem label={<TradingTargetLabel label="Take Profit 2" tooltip="Second suggested price level for securing further profits." />} value={tradingSignal.tradingTargets.takeProfit2} className="px-3 py-1.5 bg-muted/30" labelClassName="text-xs" valueClassName="text-sm"/>}
                {tradingSignal.tradingTargets.takeProfit3 && <StatItem label={<TradingTargetLabel label="Take Profit 3" tooltip="Third suggested price level for securing additional profits." />} value={tradingSignal.tradingTargets.takeProfit3} className="px-3 py-1.5 bg-muted/30 rounded-b-md" labelClassName="text-xs" valueClassName="text-sm"/>}
            </div>
          </div>

          <div>
            <h4 className="text-md font-semibold text-primary mb-2 flex items-center"><Briefcase className="mr-2 h-5 w-5"/>Investment Advice</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{tradingSignal.investmentAdvice}</p>
          </div>
          
          {tradingSignal.eventBasedTriggers && tradingSignal.eventBasedTriggers.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-primary mb-2 flex items-center"><Zap className="mr-2 h-5 w-5 text-neon"/>Event-Based Triggers</h4>
              <div className="space-y-3">
                {tradingSignal.eventBasedTriggers.map((trigger, index) => (
                  <Card key={index} className="bg-card/50 p-3 shadow-inner">
                    <h5 className="text-sm font-semibold text-primary mb-1 flex items-center">
                      {trigger.eventName}
                    </h5>
                    <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Condition:</span> {trigger.triggerCondition}</p>
                    <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Action:</span> {trigger.recommendedAction}</p>
                    {trigger.rationale && <p className="text-xs text-muted-foreground/80 mt-1 italic"><span className="font-medium text-foreground/80">Rationale:</span> {trigger.rationale}</p>}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {tradingSignal.tradingSessionInsights && (
            <div>
              <h4 className="text-md font-semibold text-primary mb-2 flex items-center"><ClockIcon className="mr-2 h-5 w-5"/>Trading Session Insights</h4>
              <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{tradingSignal.tradingSessionInsights}</p>
            </div>
          )}


          <p className="text-xs text-muted-foreground pt-3 border-t border-muted/30 mt-3">{tradingSignal.disclaimer}</p>
        </div>
      );
    }
    return <p className="text-muted-foreground text-sm text-center">No AI trading signal available for this coin.</p>;
  };

   const aiSignalInfo = (
    <>
      <h4 className="font-semibold mb-2 text-base">About AI Trading Signal</h4>
      <p>
        This section provides an AI-generated trading signal (Buy, Sell, or Hold) for the selected coin,
        based on analysis of various market factors including current price. It includes:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
        <li><strong>Recommendation:</strong> The AI's suggested action.</li>
        <li><strong>Reasoning:</strong> A brief explanation for the signal.</li>
        <li><strong>Confidence Score:</strong> AI's confidence in this signal (0-100).</li>
        <li><strong>Key Reasoning Factors:</strong> Specific data points influencing the signal.</li>
        <li><strong>Detailed Analysis:</strong> In-depth factors influencing the signal.</li>
        <li><strong>Future Price Outlook:</strong> Speculative short, mid, and long-term price targets.</li>
        <li><strong>Trading Targets:</strong> Suggested entry, stop-loss, and take-profit levels.</li>
        <li><strong>Investment Advice:</strong> General strategy notes.</li>
        <li><strong>Event-Based Triggers:</strong> Conditional strategies based on market events.</li>
        <li><strong>Trading Session Insights:</strong> Advice based on global trading session activity.</li>
      </ul>
      <p className="mt-2 text-xs">
        All information is AI-generated and for informational purposes only. DYOR.
      </p>
    </>
  );

  const getRiskLevelBadgeClasses = (level?: GetCoinRiskAssessmentOutput['riskLevel']) => {
    switch (level) {
      case 'Low': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Medium': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'High': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'Very High': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'Degenerate Gambler Zone': return 'bg-purple-600 hover:bg-purple-700 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const renderRiskAssessmentContent = () => {
    if (riskLoading) {
      return (
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-3 text-muted-foreground text-lg">Assessing Coin Risk...</p>
          </div>
          <Skeleton className="h-6 w-1/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    if (riskError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Risk Assessment Error</AlertTitle>
          <AlertDescription>{riskError}</AlertDescription>
        </Alert>
      );
    }
    if (riskAssessment) {
      const riskSubScores = [
        { label: "Volatility Risk", score: riskAssessment.volatilityScore, icon: <TrendingUpIcon className="mr-1.5 h-4 w-4"/> },
        { label: "Liquidity Risk", score: riskAssessment.liquidityScore, icon: <ActivityIcon className="mr-1.5 h-4 w-4"/> },
        { label: "Social Sentiment Risk", score: riskAssessment.socialSentimentRiskScore, icon: <UsersIcon className="mr-1.5 h-4 w-4"/> },
        { label: "Project Fundamentals Risk", score: riskAssessment.projectFundamentalsScore, icon: <FileTextIcon className="mr-1.5 h-4 w-4"/> },
      ];
      return (
        <div className="space-y-4">
          <div className="text-center">
            <Badge className={`text-lg px-4 py-1.5 font-semibold ${getRiskLevelBadgeClasses(riskAssessment.riskLevel)}`}>
              {riskAssessment.riskLevel}
            </Badge>
            <p className="text-sm text-muted-foreground mt-1">Overall Risk Score: {riskAssessment.riskScore}/100</p>
            <Progress value={riskAssessment.riskScore} className="h-2 mt-1 max-w-xs mx-auto [&>div]:bg-primary" />
             <div className="text-xs text-muted-foreground mt-1">Assessed on: {new Date(riskAssessment.assessmentDate).toLocaleDateString()}</div>
          </div>

          {riskAssessment.isHighRugRisk && (
            <Alert variant="destructive" className="border-2 border-red-700">
              <Siren className="h-5 w-5 text-red-700" />
              <AlertTitle className="text-red-700 font-bold">High Rug Risk Detected!</AlertTitle>
              <AlertDescription className="text-red-600">
                {riskAssessment.rugPullWarningSummary || "AI has flagged this coin as having multiple indicators associated with high rug pull risk. Extreme caution advised. Verify all aspects independently."}
              </AlertDescription>
            </Alert>
          )}

          <Separator />

          <div>
            <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><RiskIcon className="mr-1.5 h-5 w-5"/>Overall Assessment:</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{riskAssessment.overallAssessment}</p>
          </div>

           <Card className="bg-card border-border/50">
            <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-base text-primary/90">Risk Sub-Scores (0-100, Higher = More Risk)</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-2 px-3 py-2">
                {riskSubScores.filter(sub => sub.score !== undefined && sub.score !== null).map(sub => (
                    <div key={sub.label} className="flex justify-between items-center">
                        <span className="flex items-center text-muted-foreground">{sub.icon}{sub.label}:</span>
                        <Badge variant="outline" className="text-xs">{sub.score}</Badge>
                    </div>
                ))}
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50">
            <CardHeader className="pb-2 pt-3">
                <CardTitle className="text-base text-primary/90">Rug Pull Indicators</CardTitle>
            </CardHeader>
            <CardContent className="text-xs space-y-1.5 px-3 py-2">
                <StatItem label="Liquidity Lock" value={riskAssessment.liquidityLockStatus || "N/A"} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-xs" />
                <StatItem label="Dev Wallet/Holder Concentration" value={riskAssessment.devWalletConcentration || "N/A"} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-xs"/>
                <StatItem label="Contract Verified" value={riskAssessment.contractVerified === undefined ? "N/A" : riskAssessment.contractVerified ? "Yes" : "No"} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-xs"/>
                <StatItem label="Honeypot Signs" value={riskAssessment.honeypotIndicators || "N/A"} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-xs"/>
            </CardContent>
          </Card>


          <div>
            <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><ListChecks className="mr-1.5 h-5 w-5"/>Key Contributing Factors (General Risk):</h4>
            <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
              {riskAssessment.contributingFactors.map((factor, index) => (
                <li key={`factor-${index}`}>{factor}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><Zap className="mr-1.5 h-5 w-5"/>Mitigation Suggestions:</h4>
             <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
              {riskAssessment.mitigationSuggestions.map((suggestion, index) => (
                <li key={`suggestion-${index}`}>{suggestion}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground pt-3 border-t border-muted/30 mt-3">{riskAssessment.disclaimer}</p>
        </div>
      );
    }
    return <p className="text-muted-foreground text-sm text-center">No AI risk assessment available for this coin.</p>;
  };

   const aiRiskMeterInfo = (
    <>
      <h4 className="font-semibold mb-2 text-base">About AI Risk Meter & Rug Pull Detector</h4>
      <p>
        The AI Risk Meter provides an risk assessment for the selected coin, including specific sub-scores for Volatility, Liquidity, Social Sentiment, and Project Fundamentals.
        It also includes specific checks for common **Rug Pull Indicators**:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
        <li><strong>Liquidity Lock Status:</strong> Checks if LP tokens are locked.</li>
        <li><strong>Developer Wallet Concentration:</strong> High concentration can be a red flag.</li>
        <li><strong>Smart Contract Verification:</strong> Unverified contracts are riskier.</li>
        <li><strong>Honeypot Indicators:</strong> Looks for signs of scam contracts.</li>
        <li>A **"High Rug Risk"** badge and summary will appear if multiple red flags are detected.</li>
      </ul>
      <p className="mt-2 text-xs">
        This information is AI-generated, speculative, and not financial advice. Always DYOR.
      </p>
    </>
  );

  const getConfidenceBadgeColor = (confidence?: 'High' | 'Medium' | 'Low') => {
    if (confidence === 'High') return 'bg-green-500 hover:bg-green-600 text-white';
    if (confidence === 'Medium') return 'bg-yellow-500 hover:bg-yellow-600 text-black';
    if (confidence === 'Low') return 'bg-red-500 hover:bg-red-600 text-white';
    return 'bg-muted text-muted-foreground';
  };

  const getEntryZoneStatusBadgeClass = (status?: GetEntryZoneStatusOutput['status']) => {
    if (!status) return 'border-muted-foreground text-muted-foreground';
    const s = status.toLowerCase();
    if (s.includes('early') || s.includes('breakout') || s.includes('accumulation')) return 'border-green-500 text-green-500';
    if (s.includes('overheated') || s.includes('caution')) return 'border-red-500 text-red-500';
    if (s.includes('neutral') || s.includes('monitor')) return 'border-yellow-500 text-yellow-500';
    return 'border-muted-foreground text-muted-foreground';
  };

  const renderEntryZoneStatus = () => {
    if (entryZoneLoading) return <Skeleton className="h-6 w-32" />;
    if (entryZoneError) return <Badge variant="destructive" className="text-xs">Status Error</Badge>;
    if (entryZoneStatus) {
      return (
        <Popover>
          <PopoverTrigger asChild>
             <Badge variant="outline" className={`text-xs cursor-pointer ${getEntryZoneStatusBadgeClass(entryZoneStatus.status)}`}>
              <MapPin className="mr-1 h-3 w-3" /> {entryZoneStatus.status}
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-60 text-xs p-2">
            <p className="font-semibold mb-1">AI Entry Zone Reasoning:</p>
            <p className="text-muted-foreground mb-1">{entryZoneStatus.reasoning}</p>
            <p className="text-muted-foreground/80">Confidence: {entryZoneStatus.confidence}</p>
            <p className="text-muted-foreground/70 text-xs mt-2">{entryZoneStatus.disclaimer}</p>
          </PopoverContent>
        </Popover>
      );
    }
    return null;
  };

  const renderViralPredictionContent = () => {
    if (viralPredictionLoading) {
      return (
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-3 text-muted-foreground text-lg">Predicting Virality Potential...</p>
          </div>
          <Skeleton className="h-6 w-1/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    if (viralPredictionError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Virality Prediction Error</AlertTitle>
          <AlertDescription>{viralPredictionError}</AlertDescription>
        </Alert>
      );
    }
    if (viralPrediction) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-1.5 font-semibold border-neon text-neon">
              {viralPrediction.timeToTrendEstimate}
            </Badge>
            <div className="text-sm text-muted-foreground mt-1">
              AI Confidence:
              <Badge className={cn("ml-1.5 text-xs", getConfidenceBadgeColor(viralPrediction.confidence))}>
                {viralPrediction.confidence}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><ViralityIcon className="mr-1.5 h-5 w-5"/>Reasoning:</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{viralPrediction.reasoning}</p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><ListChecks className="mr-1.5 h-5 w-5"/>Key Factors:</h4>
            <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
              {viralPrediction.keyFactors.map((factor, index) => (
                <li key={`viral-factor-${index}`}>{factor}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground pt-3 border-t border-muted/30 mt-3">{viralPrediction.disclaimer}</p>
        </div>
      );
    }
    return <p className="text-muted-foreground text-sm text-center">No AI virality prediction available for this coin.</p>;
  };

   const aiViralityInfo = (
    <>
      <h4 className="font-semibold mb-2 text-base">About AI Time-to-Viral Predictor</h4>
      <p>
        This AI feature analyzes social media volume, mentions, influencer activity, and market catalysts to estimate a coin's potential to trend or "go viral."
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
        <li><strong>Time to Trend Estimate:</strong> AI's speculative timeframe for potential virality.</li>
        <li><strong>Confidence:</strong> The AI's confidence in this prediction.</li>
        <li><strong>Key Factors:</strong> Simulated drivers behind the prediction.</li>
        <li><strong>Reasoning:</strong> AI's explanation.</li>
      </ul>
      <p className="mt-2 text-xs">
        This is a highly speculative AI feature. Not financial advice. DYOR.
      </p>
    </>
  );

  const renderLifespanPredictionContent = () => {
    if (lifespanLoading) {
      return (
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-3 text-muted-foreground text-lg">Predicting Lifespan & Exit...</p>
          </div>
          <Skeleton className="h-6 w-1/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-16 w-full" />
        </div>
      );
    }
    if (lifespanError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Lifespan Prediction Error</AlertTitle>
          <AlertDescription>{lifespanError}</AlertDescription>
        </Alert>
      );
    }
    if (lifespanPrediction) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <Badge variant="outline" className="text-lg px-4 py-1.5 font-semibold border-orange-500 text-orange-500">
              {lifespanPrediction.lifespanEstimate}
            </Badge>
             <div className="text-sm text-muted-foreground mt-1">
              AI Confidence:
              <Badge className={cn("ml-1.5 text-xs", getConfidenceBadgeColor(lifespanPrediction.confidence))}>
                {lifespanPrediction.confidence}
              </Badge>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><TrendingDownIcon className="mr-1.5 h-5 w-5 text-orange-500"/>Exit Recommendation:</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{lifespanPrediction.exitRecommendation}</p>
          </div>

          <div>
            <h4 className="text-md font-semibold text-primary mb-1 flex items-center"><ListChecks className="mr-1.5 h-5 w-5"/>Key Factors Considered:</h4>
            <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
              {lifespanPrediction.keyFactors.map((factor, index) => (
                <li key={`lifespan-factor-${index}`}>{factor}</li>
              ))}
            </ul>
          </div>
          <p className="text-xs text-muted-foreground pt-3 border-t border-muted/30 mt-3">Analysis as of: {new Date(lifespanPrediction.analysisTimestamp).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground pt-1">{lifespanPrediction.disclaimer}</p>
        </div>
      );
    }
    return <p className="text-muted-foreground text-sm text-center">No AI lifespan prediction available for this coin.</p>;
  };

  const aiLifespanInfo = (
    <>
      <h4 className="font-semibold mb-2 text-base">About AI Lifespan Predictor</h4>
      <p>
        This AI feature analyzes a meme coin's current hype cycle, considering factors like volume decay, social sentiment shifts, and historical patterns to estimate its potential lifespan.
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
        <li><strong>Lifespan Estimate:</strong> AI's speculative timeframe for the current hype.</li>
        <li><strong>Exit Recommendation:</strong> AI-suggested considerations for de-risking.</li>
        <li><strong>Confidence:</strong> The AI's confidence in this prediction.</li>
        <li><strong>Key Factors:</strong> Simulated drivers behind the prediction.</li>
      </ul>
      <p className="mt-2 text-xs">
        This is a highly speculative AI feature. Not financial advice. Always manage risk and DYOR.
      </p>
    </>
  );

  const renderSignalPerformanceContent = () => {
    if (performanceLoading) {
      return (
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-center">
             <Loader2 className="h-8 w-8 animate-spin text-primary" />
             <p className="ml-3 text-muted-foreground text-lg">Analyzing Simulated Signal Performance...</p>
          </div>
          <Skeleton className="h-6 w-1/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-2" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }
    if (performanceError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Performance Analysis Error</AlertTitle>
          <AlertDescription>{performanceError}</AlertDescription>
        </Alert>
      );
    }
    if (signalPerformance) {
      return (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Last Simulated Backtest: {signalPerformance.lastSimulatedBacktestDate}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatItem label="Simulated Accuracy" value={`${signalPerformance.simulatedAccuracyRate.toFixed(1)}%`} className="bg-muted/30 p-2 rounded-md text-center flex-col h-auto" labelClassName="text-xs" valueClassName="text-lg font-bold text-neon" />
            <StatItem label="Simulated Profit Factor" value={`${signalPerformance.simulatedProfitFactor.toFixed(2)}`} className="bg-muted/30 p-2 rounded-md text-center flex-col h-auto" labelClassName="text-xs" valueClassName="text-lg font-bold text-neon" />
          </div>

          <Separator />

          <div>
            <h4 className="text-md font-semibold text-primary mb-1">Summary of Simulated Performance:</h4>
            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md whitespace-pre-wrap">{signalPerformance.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-semibold text-primary mb-1">Key Strengths:</h4>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
                {signalPerformance.keyStrengths.map((strength, index) => (
                  <li key={`strength-${index}`}>{strength}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-md font-semibold text-primary mb-1">Key Weaknesses:</h4>
              <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
                {signalPerformance.keyWeaknesses.map((weakness, index) => (
                  <li key={`weakness-${index}`}>{weakness}</li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-muted-foreground pt-3 border-t border-muted/30 mt-3">{signalPerformance.disclaimer}</p>
        </div>
      );
    }
    return <p className="text-muted-foreground text-sm text-center">No AI signal performance data available for this coin.</p>;
  };

  const aiSignalPerformanceInfo = (
    <>
      <h4 className="font-semibold mb-2 text-base">About AI Signal Performance (Simulated)</h4>
      <p>
        This section provides a simulated historical performance analysis of the AI's trading signals for this specific coin. It's designed to give an idea of how the AI *might* have performed in the past.
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
        <li><strong>Simulated Accuracy Rate:</strong> An estimated percentage of historically "correct" signals.</li>
        <li><strong>Simulated Profit Factor:</strong> A ratio of conceptual gross profit to gross loss from past signals.</li>
        <li><strong>Key Strengths/Weaknesses:</strong> AI's self-assessment of its signal strategy for this coin.</li>
        <li><strong>Summary:</strong> Overall textual analysis of the simulated performance.</li>
      </ul>
      <p className="mt-2 font-bold text-xs">
        IMPORTANT: This is entirely simulated and not based on actual trading or real backtesting. Past simulated performance is not indicative of future results. DYOR.
      </p>
    </>
  );

  const tokenomicsBlueprintInfo = (
    <>
      <h4 className="font-semibold mb-2 text-base">About Tokenomics Blueprint</h4>
      <p>
        This section provides an overview of the coin's supply metrics and AI-generated conceptual insights into its tokenomics, such as typical allocation models, vesting schedules, and audit considerations for a coin like this.
      </p>
      <ul className="list-disc list-inside mt-2 space-y-1 text-xs">
        <li><strong>Supply Metrics:</strong> Circulating, total, and max supply from API.</li>
        <li><strong>AI Conceptual Insights:</strong> AI-generated text on allocation, vesting, audits, and dev wallets based on general patterns for this type of coin.</li>
      </ul>
      <p className="mt-2 text-xs">
        Always refer to official project documentation for detailed and verified tokenomics. AI insights here are conceptual.
      </p>
    </>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button variant="outline" asChild className="mb-0 md:mb-2">
          <Link href="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
        </Button>
      </div>

      <Card className="shadow-lg overflow-hidden">
        <CardHeader className="bg-card p-4">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Image src={image.large || 'https://placehold.co/128x128.png'} alt={name} width={64} height={64} className="rounded-full border-2 border-primary" data-ai-hint="coin logo crypto"/>
                <div className="flex-grow text-center sm:text-left">
                    <h1 className="text-2xl sm:text-3xl font-bold text-neon flex items-center justify-center sm:justify-start">
                        {name} <Badge variant="secondary" className="ml-2 text-base sm:text-lg">{symbol.toUpperCase()}</Badge>
                        {entryZoneStatus && <span className="ml-2">{renderEntryZoneStatus()}</span>}
                    </h1>
                    {market_cap_rank && <div className="text-sm text-muted-foreground">Market Cap Rank: #{market_cap_rank}</div>}
                    
                    {riskAssessment && (
                        <div className="mt-2">
                            <TokenDnaStrip
                            marketCapTierScore={riskAssessment.marketCapTierScore}
                            communityStrengthScore={riskAssessment.communityStrengthScore}
                            developerActivityScore={riskAssessment.developerActivityScore}
                            memeStrengthScore={riskAssessment.memeStrengthScore}
                            />
                        </div>
                    )}
                    {(riskLoading || loading) && !riskAssessment && (
                        <div className="mt-2">
                            <Skeleton className="h-10 w-full rounded-md" /> 
                        </div>
                    )}


                </div>
                <div className="text-center sm:text-right">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: currentPrice > 0.01 ? 2 : 8 })}</div>
                <div className={cn("text-base font-semibold", priceChange24h >= 0 ? 'text-green-400' : 'text-red-400')}>
                    {priceChange24h.toFixed(2)}% (24h)
                </div>
                </div>
            </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
           <SectionCard
             title="AI Trading Signal & Analysis"
             icon={<BrainCircuit className="h-5 w-5"/>}
             noPadding
             infoPopoverContent={aiSignalInfo}
           >
             {renderSignalContent()}
           </SectionCard>

            <SectionCard
                title="AI Risk Meter & Rug Pull Detector"
                icon={<RiskIcon className="h-5 w-5"/>}
                noPadding
                infoPopoverContent={aiRiskMeterInfo}
              >
              {renderRiskAssessmentContent()}
            </SectionCard>

            <SectionCard
              title="Tokenomics Blueprint"
              icon={<Layers className="h-5 w-5" />}
              noPadding
              infoPopoverContent={tokenomicsBlueprintInfo}
              defaultOpenAccordion={false}
            >
                <Accordion type="single" collapsible className="w-full" defaultValue="supply">
                  <AccordionItem value="supply">
                    <AccordionTrigger className="py-3 px-4 hover:no-underline flex-grow p-0 justify-between text-lg font-semibold">
                        <div className="flex items-center">
                            <FileJson className="mr-2 h-4 w-4" />Supply Metrics (Live Data)
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground !pt-0 !pb-0">
                      <StatItem label="Circulating Supply" value={market_data.circulating_supply} unit={symbol.toUpperCase()} className="!pt-0 !pb-0" />
                      <StatItem label="Total Supply" value={market_data.total_supply} unit={symbol.toUpperCase()} className="!pt-0 !pb-0" />
                      <StatItem label="Max Supply" value={market_data.max_supply} unit={symbol.toUpperCase()} className="!pt-0 !pb-0" />
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="conceptual-allocation">
                     <AccordionTrigger className="py-3 px-4 hover:no-underline flex-grow p-0 justify-between text-lg font-semibold">
                        <div className="flex items-center">
                            <UsersRound className="mr-2 h-4 w-4" />AI Conceptual Allocation
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground px-4 py-2">
                        {tokenomicsLoading && <Skeleton className="h-12 w-full" />}
                        {tokenomicsError && <Alert variant="destructive" className="text-xs py-1 px-2"><AlertDescription>{tokenomicsError}</AlertDescription></Alert>}
                        {tokenomicsAnalysis && <p className="whitespace-pre-wrap">{tokenomicsAnalysis.conceptualAllocationSummary}</p>}
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="conceptual-vesting">
                     <AccordionTrigger className="py-3 px-4 hover:no-underline flex-grow p-0 justify-between text-lg font-semibold">
                        <div className="flex items-center">
                            <KeyRound className="mr-2 h-4 w-4" />AI Conceptual Vesting
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground px-4 py-2">
                        {tokenomicsLoading && <Skeleton className="h-12 w-full" />}
                        {tokenomicsError && <Alert variant="destructive" className="text-xs py-1 px-2"><AlertDescription>{tokenomicsError}</AlertDescription></Alert>}
                        {tokenomicsAnalysis && <p className="whitespace-pre-wrap">{tokenomicsAnalysis.conceptualVestingInsights}</p>}
                    </AccordionContent>
                  </AccordionItem>
                   <AccordionItem value="simulated-audit">
                        <AccordionTrigger className="py-3 px-4 hover:no-underline flex-grow p-0 justify-between text-lg font-semibold">
                            <div className="flex items-center">
                                <AuditIcon className="mr-2 h-4 w-4" />AI Simulated Audit Concerns
                            </div>
                        </AccordionTrigger>
                    <AccordionContent className="text-xs text-muted-foreground px-4 py-2">
                        {tokenomicsLoading && <Skeleton className="h-12 w-full" />}
                        {tokenomicsError && <Alert variant="destructive" className="text-xs py-1 px-2"><AlertDescription>{tokenomicsError}</AlertDescription></Alert>}
                        {tokenomicsAnalysis && <p className="whitespace-pre-wrap">{tokenomicsAnalysis.simulatedAuditConcerns}</p>}
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="dev-wallets" className="border-b-0">
                        <AccordionTrigger className="py-3 px-4 hover:no-underline flex-grow p-0 justify-between text-lg font-semibold">
                            <div className="flex items-center">
                                <Briefcase className="mr-2 h-4 w-4" />AI Dev Wallet Observations
                            </div>
                        </AccordionTrigger>
                     <AccordionContent className="text-xs text-muted-foreground px-4 py-2">
                        {tokenomicsLoading && <Skeleton className="h-12 w-full" />}
                        {tokenomicsError && <Alert variant="destructive" className="text-xs py-1 px-2"><AlertDescription>{tokenomicsError}</AlertDescription></Alert>}
                        {tokenomicsAnalysis && <p className="whitespace-pre-wrap">{tokenomicsAnalysis.devWalletObservations}</p>}
                         {tokenomicsAnalysis?.disclaimer && <p className="text-xs italic mt-3 opacity-80">{tokenomicsAnalysis.disclaimer}</p>}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
            </SectionCard>


            <SectionCard
              title="AI Time-to-Viral Predictor"
              icon={<ViralityIcon className="h-5 w-5" />}
              noPadding
              infoPopoverContent={aiViralityInfo}
            >
              {renderViralPredictionContent()}
            </SectionCard>

            <SectionCard
              title="AI Lifespan Predictor"
              icon={<Hourglass className="h-5 w-5" />}
              noPadding
              infoPopoverContent={aiLifespanInfo}
            >
              {renderLifespanPredictionContent()}
            </SectionCard>

            <SectionCard
              title="AI Signal Performance (Simulated)"
              icon={<BarChartBig className="h-5 w-5" />}
              noPadding
              infoPopoverContent={aiSignalPerformanceInfo}
            >
              {renderSignalPerformanceContent()}
            </SectionCard>

          <SectionCard title="Description" icon={<BookOpen className="h-5 w-5"/>}>
            {cleanDescription ? (
              <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: cleanDescription }} />
            ) : (
              <p className="text-muted-foreground text-sm">No description available.</p>
            )}
          </SectionCard>

          <SectionCard title="Links" icon={<Globe className="h-5 w-5"/>}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
              {links.homepage?.[0] && (
                <Button variant="link" asChild className="p-0 h-auto justify-start text-sm text-muted-foreground hover:text-primary">
                  <a href={links.homepage[0]} target="_blank" rel="noopener noreferrer">
                    <Globe className="mr-2 h-4 w-4" /> Official Website <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              {links.blockchain_site?.[0] && (
                 <Button variant="link" asChild className="p-0 h-auto justify-start text-sm text-muted-foreground hover:text-primary">
                  <a href={links.blockchain_site[0]} target="_blank" rel="noopener noreferrer">
                    <Package className="mr-2 h-4 w-4" /> Blockchain Explorer <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
               {links.twitter_screen_name && (
                 <Button variant="link" asChild className="p-0 h-auto justify-start text-sm text-muted-foreground hover:text-primary">
                  <a href={`https://twitter.com/${links.twitter_screen_name}`} target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.39.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.32 4.507 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></svg>
                    Twitter <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
               {links.telegram_channel_identifier && (
                 <Button variant="link" asChild className="p-0 h-auto justify-start text-sm text-muted-foreground hover:text-primary">
                  <a href={`https://t.me/${links.telegram_channel_identifier}`} target="_blank" rel="noopener noreferrer">
                    <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M9.78 18.65l.28-4.23c.07-.99-.46-1.4-1.02-1.8l-2.4-1.6c-.57-.38-.84-.9-.58-1.5.27-.62.9-.9 1.55-.75l11.07 4.3c.66.26.97.88.8 1.5-.17.63-.8 1-1.52.75l-3.6-1.7c-.64-.3-1.42.17-1.32 1.07l.3 3.5c.05.6-.2 1.18-.7 1.5s-1.18.35-1.75-.04L9.78 18.65z"></path></svg>
                    Telegram <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </Button>
              )}
              {links.subreddit_url && (
                 <Button variant="link" asChild className="p-0 h-auto justify-start text-sm text-muted-foreground hover:text-primary">
                  <a href={links.subreddit_url} target="_blank" rel="noopener noreferrer">
                     <svg className="mr-2 h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M12.01,2.02 C12.01,2.02 11.02,2.02 10.08,2.04 C8.93,2.07 7.89,2.17 7.89,2.17 C7.89,2.17 7.07,2.31 6.45,2.93 C5.83,3.55 5.69,4.37 5.69,4.37 C5.69,4.37 5.59,5.41 5.56,6.56 C5.53,7.71 5.53,8.71 5.53,8.71 C5.53,8.71 5.53,9.81 5.56,11.07 C5.59,12.33 5.69,13.57 5.69,13.57 C5.69,13.57 5.83,14.39 6.45,15.01 C7.07,15.63 7.89,15.77 7.89,15.77 C7.89,15.77 8.93,15.87 10.08,15.9 C11.23,15.93 12.01,15.92 12.01,15.92 C12.01,15.92 13.00,15.92 14.15,15.89 C15.30,15.86 16.34,15.76 16.34,15.76 C16.34,15.76 17.16,15.62 17.78,15.00 C18.40,14.38 18.54,13.56 18.54,13.56 C18.54,13.56 18.64,12.52 18.67,11.37 C18.70,10.22 18.70,9.22 18.70,9.22 C18.70,9.22 18.70,8.12 18.67,6.86 C18.64,5.60 18.54,4.36 18.54,4.36 C18.54,4.36 18.40,3.54 17.78,2.92 C17.16,2.30 16.34,2.16 16.34,2.16 C16.34,2.16 15.30,2.06 14.15,2.03 C12.98,2.00 12.01,2.02 12.01,2.02 Z M12.00,5.76 C13.66,5.76 15.00,7.10 15.00,8.76 C15.00,10.42 13.66,11.76 12.00,11.76 C10.34,11.76 9.00,10.42 9.00,8.76 C9.00,7.10 10.34,5.76 12.00,5.76 Z M12.00,13.00 C14.38,13.00 16.34,13.83 17.50,15.00 L6.50,15.00 C7.66,13.83 9.62,13.00 12.00,13.00 Z M6.00,19.00 C6.00,19.00 6.00,20.00 7.00,20.00 L17.00,20.00 C18.00,20.00 18.00,19.00 18.00,19.00 L6.00,19.00 Z M12.00,17.25 C10.90,17.25 10.00,18.15 10.00,19.25 C10.00,20.35 10.90,21.25 12.00,21.25 C13.10,21.25 14.00,20.35 14.00,19.25 C14.00,18.15 13.10,17.25 12.00,17.25 Z" /></svg>
                    Reddit <ExternalLink className="ml-1 h-3 w-3" />
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
    

    
```