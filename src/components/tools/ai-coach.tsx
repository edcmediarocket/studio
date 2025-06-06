
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { getCoinTradingSignal, type GetCoinTradingSignalOutput, type GetCoinTradingSignalInput } from "@/ai/flows/get-coin-trading-signal";
import { getCoinRiskAssessment, type GetCoinRiskAssessmentOutput } from "@/ai/flows/get-coin-risk-assessment";
import { getWhatIfScenarioSignal, type GetWhatIfScenarioSignalInput, type GetWhatIfScenarioSignalOutput } from "@/ai/flows/get-what-if-scenario-signal";
import { calculateFutureProfit, type CalculateFutureProfitInput, type CalculateFutureProfitOutput } from "@/ai/flows/calculate-future-profit";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, AlertTriangle, Info, DollarSign, TrendingUp, TrendingDown, ShieldCheck, Target, HelpCircle, Briefcase, GraduationCap, CheckCircle, XCircle, MinusCircle, Siren, Mic, BarChart, MessageSquare, Zap, ListChecks, FileText, SlidersHorizontal, CalendarClock, Clock4, Percent, TrendingUpIcon, TrendingDownIcon, ActivityIcon, UsersIcon, FileTextIcon } from "lucide-react"; 
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { StatItem } from '@/components/shared/stat-item';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";


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
  if (impact === "Positive") return <CheckCircle className="h-4 w-4 text-green-500" />;
  if (impact === "Negative") return <XCircle className="h-4 w-4 text-red-500" />;
  return <MinusCircle className="h-4 w-4 text-yellow-500" />;
};

const tradingStyleOptions = [
  { value: "Conservative", label: "Conservative (Long-term, Low Risk)" },
  { value: "Swing Trader", label: "Swing Trader (Mid-term, TA Focus)" },
  { value: "Scalper", label: "Scalper (Intraday, Micro Moves)" },
  { value: "High-Risk/High-Reward", label: "High-Risk/High-Reward (Momentum)" },
  { value: "AI Hybrid", label: "AI Hybrid (Optimized Mix)" },
];


export function AiCoach() {
  const [coinName, setCoinName] = useState("");
  const [selectedTradingStyle, setSelectedTradingStyle] = useState<GetCoinTradingSignalInput['tradingStyle'] | undefined>(undefined);
  const [coachAdvice, setCoachAdvice] = useState<GetCoinTradingSignalOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [currentCoinPrice, setCurrentCoinPrice] = useState<number | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);

  const [threatRadarData, setThreatRadarData] = useState<GetCoinRiskAssessmentOutput | null>(null);
  const [threatRadarLoading, setThreatRadarLoading] = useState(false);
  const [threatRadarError, setThreatRadarError] = useState<string | null>(null);

  const [isVoiceLoading, setIsVoiceLoading] = useState(false);

  const [hypotheticalPrice, setHypotheticalPrice] = useState<string>("");
  const [hypotheticalVolumeCondition, setHypotheticalVolumeCondition] = useState<string>("");
  const [whatIfSignal, setWhatIfSignal] = useState<GetWhatIfScenarioSignalOutput | null>(null);
  const [isLoadingWhatIf, setIsLoadingWhatIf] = useState(false);
  const [whatIfError, setWhatIfError] = useState<string | null>(null);

  // State for Future Profit Estimator
  const [profitCalcCoinName, setProfitCalcCoinName] = useState("");
  const [buyPrice, setBuyPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [profitCalcResult, setProfitCalcResult] = useState<CalculateFutureProfitOutput | null>(null);
  const [isLoadingProfitCalc, setIsLoadingProfitCalc] = useState(false);
  const [profitCalcError, setProfitCalcError] = useState<string | null>(null);


  const fetchPriceForCoin = useCallback(async (nameOfCoin: string): Promise<number | null> => {
    if (!nameOfCoin.trim()) return null;
    setPriceLoading(true);
    setPriceError(null);
    let fetchedPrice: number | null = null;

    let coinId = nameOfCoin.trim().toLowerCase();
    const coinIdMappings: { [key: string]: string } = {
      "xrp": "ripple", "shiba inu": "shiba-inu", "dogecoin": "dogecoin", "xdc": "xdce-crowd-sale",
    };
    coinId = coinIdMappings[coinId] || coinId.replace(/\s+/g, '-');

    try {
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        const apiErrorMessage = errorData?.error || `CoinGecko API error (Status: ${response.status})`;
        setPriceError(`Price fetch failed for ${nameOfCoin}: ${apiErrorMessage}. AI advice will use last known or no price.`);
      } else {
        const data = await response.json();
        if (data[coinId] && data[coinId].usd !== undefined) {
          fetchedPrice = data[coinId].usd;
        } else {
          setPriceError(`Current price not available for "${nameOfCoin}" from CoinGecko. AI advice will be general.`);
        }
      }
    } catch (err) {
      setPriceError(`Network error fetching price for "${nameOfCoin}". AI advice will be general.`);
    } finally {
      setPriceLoading(false);
    }
    return fetchedPrice;
  }, []);


   useEffect(() => {
    const debounceTimer = setTimeout(async () => {
        if (coinName.trim()) {
            const price = await fetchPriceForCoin(coinName);
            setCurrentCoinPrice(price);
             // Also set the coin name for profit calculator if not already set by user
            if (!profitCalcCoinName.trim() && coinName.trim()) {
                setProfitCalcCoinName(coinName.trim());
            }
        } else {
            setCurrentCoinPrice(null);
            setPriceError(null);
        }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [coinName, fetchPriceForCoin, profitCalcCoinName]);

  const getCoachingData = useCallback(async (nameForCoaching: string, style?: GetCoinTradingSignalInput['tradingStyle']) => {
    setIsLoading(true);
    setThreatRadarLoading(true);
    setError(null);
    setThreatRadarError(null);
    setCoachAdvice(null);
    setThreatRadarData(null);
    setWhatIfSignal(null);
    setWhatIfError(null);
    setProfitCalcResult(null); 
    setProfitCalcError(null);


    let priceForAnalysis = currentCoinPrice;
    
    if (nameForCoaching.toLowerCase() !== coinName.toLowerCase() || currentCoinPrice === null) {
        toast({ title: "Fetching Context", description: `Getting latest price for ${nameForCoaching}...`, duration: 2000});
        priceForAnalysis = await fetchPriceForCoin(nameForCoaching);
        
        if (nameForCoaching.toLowerCase() === coinName.toLowerCase()) {
          setCurrentCoinPrice(priceForAnalysis);
        }
    }


    try {
      const adviceResult = await getCoinTradingSignal({
        coinName: nameForCoaching,
        currentPriceUSD: priceForAnalysis !== null ? priceForAnalysis : undefined,
        tradingStyle: style,
      });
      setCoachAdvice(adviceResult);
    } catch (err) {
      console.error("Error getting AI Coach advice:", err);
      setError("Failed to get coaching advice. The AI Coach might be strategizing, please try again later.");
    } finally {
        setIsLoading(false);
    }

    try {
        const riskResult = await getCoinRiskAssessment({ coinName: nameForCoaching });
        setThreatRadarData(riskResult);
    } catch (riskErr) {
        console.error("Error fetching threat radar data:", riskErr);
        setThreatRadarError("Failed to fetch on-chain threat radar. AI analysis may be incomplete.");
    } finally {
        setThreatRadarLoading(false);
    }
  }, [currentCoinPrice, fetchPriceForCoin, coinName, toast]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coinName.trim()) {
      setError("Please enter a coin name to get coaching advice.");
      setCoachAdvice(null);
      setThreatRadarData(null);
      setWhatIfSignal(null);
      setProfitCalcResult(null);
      return;
    }
    if (!selectedTradingStyle) {
      setError("Please select a trading style.");
      return;
    }
    getCoachingData(coinName.trim(), selectedTradingStyle);
  };

  const handleVoiceCommand = useCallback(async () => {
    setIsVoiceLoading(true);
    const query = window.prompt("Ask the AI Coach (e.g., 'Signal for Dogecoin', 'Analyze PEPE'):");
    if (query && query.trim()) {
        let parsedCoinName = query.trim();
        const patterns = [
            /signal for (.+)/i, /analyze (.+)/i, /what about (.+)/i, /tell me about (.+)/i
        ];
        for (const pattern of patterns) {
            const match = query.match(pattern);
            if (match && match[1]) {
                parsedCoinName = match[1].trim();
                break;
            }
        }

        if (parsedCoinName) {
            setCoinName(parsedCoinName);
            if (selectedTradingStyle) {
              toast({ title: "Processing Voice Command", description: `Analyzing ${parsedCoinName} for ${selectedTradingStyle} style...`, duration: 2000});
              setTimeout(() => {
                if(selectedTradingStyle){ 
                  getCoachingData(parsedCoinName, selectedTradingStyle);
                }
              }, 700); 
            } else {
              toast({ title: "Trading Style Needed", description: "Please select a trading style to get advice for " + parsedCoinName, variant: "default"});
            }
        } else {
            toast({ title: "Voice Query", description: "Could not identify a coin name. Please be more specific or type the name.", variant: "default"});
        }
    }
    setIsVoiceLoading(false);
  }, [toast, getCoachingData, selectedTradingStyle]);

  const handleSimulateWhatIf = async () => {
    if (!coinName.trim()) {
        setWhatIfError("Please enter a base coin name first.");
        return;
    }
    if (!hypotheticalPrice.trim() || !hypotheticalVolumeCondition.trim()) {
        setWhatIfError("Please provide both a hypothetical price and volume condition for the What-If scenario.");
        return;
    }
    const hypoPriceNum = parseFloat(hypotheticalPrice);
    if (isNaN(hypoPriceNum) || hypoPriceNum <=0) {
        setWhatIfError("Hypothetical price must be a valid positive number.");
        return;
    }

    setIsLoadingWhatIf(true);
    setWhatIfError(null);
    setWhatIfSignal(null);

    try {
        const scenarioInput: GetWhatIfScenarioSignalInput = {
            coinName: coinName.trim(),
            currentPriceUSD: currentCoinPrice ?? undefined,
            hypotheticalPriceUSD: hypoPriceNum,
            hypotheticalVolumeCondition: hypotheticalVolumeCondition.trim(),
        };
        const result = await getWhatIfScenarioSignal(scenarioInput);
        setWhatIfSignal(result);
    } catch (err) {
        console.error("Error getting What-If scenario signal:", err);
        setWhatIfError("Failed to generate What-If scenario. The AI may be contemplating alternate realities, please try again.");
    } finally {
        setIsLoadingWhatIf(false);
    }
  };

  const handleProfitCalcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profitCalcCoinName.trim() || !buyPrice.trim() || !quantity.trim() || !targetPrice.trim()) {
        setProfitCalcError("Please fill in all fields for the profit calculation.");
        return;
    }
    const numBuyPrice = parseFloat(buyPrice);
    const numQuantity = parseFloat(quantity);
    const numTargetPrice = parseFloat(targetPrice);

    if (isNaN(numBuyPrice) || numBuyPrice <= 0 || isNaN(numQuantity) || numQuantity <= 0 || isNaN(numTargetPrice) || numTargetPrice <= 0) {
        setProfitCalcError("Buy Price, Quantity, and Target Price must be valid positive numbers.");
        return;
    }

    setIsLoadingProfitCalc(true);
    setProfitCalcError(null);
    setProfitCalcResult(null);

    try {
        const input: CalculateFutureProfitInput = {
            coinName: profitCalcCoinName.trim(),
            buyPrice: numBuyPrice,
            quantity: numQuantity,
            targetPrice: numTargetPrice,
        };
        const result = await calculateFutureProfit(input);
        setProfitCalcResult(result);
    } catch (err) {
        console.error("Error calculating future profit:", err);
        setProfitCalcError("Failed to calculate profit. The AI might be crunching numbers, please try again.");
    } finally {
        setIsLoadingProfitCalc(false);
    }
  };


  const getRecommendationBadgeVariant = (recommendation?: GetCoinTradingSignalOutput['recommendation'] | GetWhatIfScenarioSignalOutput['recommendation']) => {
    const recString = recommendation as string; 
    if (!recString) return 'outline';
    if (recString.toLowerCase().includes('buy')) return 'default'; 
    if (recString.toLowerCase().includes('sell')) return 'destructive'; 
    if (recString.toLowerCase().includes('hold')) return 'secondary'; 
    return 'outline';
  };

  const getThreatLevelBadgeClasses = (riskLevel?: GetCoinRiskAssessmentOutput['riskLevel'], isHighRugRisk?: boolean) => {
    if (isHighRugRisk) return 'bg-red-700 hover:bg-red-800 text-white border-red-900';
    switch (riskLevel) {
      case 'Low': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'Medium': return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      case 'High': return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'Very High': return 'bg-red-600 hover:bg-red-700 text-white';
      case 'Degenerate Gambler Zone': return 'bg-purple-600 hover:bg-purple-700 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const mainLoading = isLoading || threatRadarLoading || priceLoading;

  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="flex items-center text-xl text-primary">
          <GraduationCap className="mr-2 h-5 w-5" /> Ask the AI Coach
        </CardTitle>
        <CardDescription>
          Enter a coin name and select your trading style to receive advanced investment strategies, signals, and its on-chain threat assessment.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <Label htmlFor="coach-coinName">Coin Name</Label>
            <div className="flex items-center space-x-2 mt-1">
                <Input
                id="coach-coinName"
                type="text"
                placeholder="e.g., Dogecoin, Shiba Inu"
                value={coinName}
                onChange={(e) => setCoinName(e.target.value)}
                disabled={mainLoading || isVoiceLoading}
                className="flex-grow"
                />
                <Button type="button" size="icon" variant="outline" onClick={handleVoiceCommand} disabled={mainLoading || isVoiceLoading} title="Ask with Voice (Simulated)">
                    {isVoiceLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                </Button>
            </div>
             {priceLoading && (
                <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> Fetching current price for {coinName.trim()}...
                </div>
            )}
            {priceError && !priceLoading && (
                <p className="mt-1 text-xs text-destructive">{priceError}</p>
            )}
            {currentCoinPrice !== null && !priceLoading && !priceError && (
                 <p className="mt-1 text-xs text-green-500">
                    Current price for {coinName.trim()}: ${currentCoinPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: currentCoinPrice < 0.01 && currentCoinPrice !== 0 ? 8 : 2,
                    })}
                </p>
            )}
          </div>

          <div>
            <Label htmlFor="coach-tradingStyle">Trading Style</Label>
            <Select
              value={selectedTradingStyle}
              onValueChange={(value) => setSelectedTradingStyle(value as GetCoinTradingSignalInput['tradingStyle'])}
              disabled={mainLoading || isVoiceLoading}
            >
              <SelectTrigger id="coach-tradingStyle" className="mt-1">
                <SelectValue placeholder="Select your trading style..." />
              </SelectTrigger>
              <SelectContent>
                {tradingStyleOptions.map(style => (
                  <SelectItem key={style.value} value={style.value}>{style.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={mainLoading || !coinName.trim() || !selectedTradingStyle} className="w-full bg-primary hover:bg-primary/90">
            {mainLoading && !isVoiceLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Get AI Coaching & Threat Scan
              </>
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Coaching Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {coachAdvice && !isLoading && (
          <div className="mt-8 space-y-6">
            <Separator />
            <h3 className="text-xl font-semibold text-neon text-center">
              AI Coach's Strategy for: {coinName.trim().toUpperCase()}
            </h3>
             <CardDescription className="text-center -mt-3">
              Tailored for: <Badge variant="secondary">{selectedTradingStyle || "General"}</Badge>
            </CardDescription>
             {currentCoinPrice !== null && (
                <p className="text-xs text-muted-foreground text-center -mt-3">
                    (Analysis based on current price of ${currentCoinPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: currentCoinPrice < 0.01 && currentCoinPrice !== 0 ? 8 : 2,
                    })})
                </p>
            )}

            <div className="flex flex-col items-center space-y-2 text-center p-4 bg-muted/30 rounded-lg">
              <Badge variant={getRecommendationBadgeVariant(coachAdvice.recommendation)} className="text-lg px-4 py-1.5 font-semibold">
                {coachAdvice.recommendation}
              </Badge>
              <p className="text-sm text-muted-foreground">{coachAdvice.reasoning}</p>
              <div>
                 <span className="text-sm font-medium text-foreground">AI Confidence: {coachAdvice.confidenceScore}%</span>
                 <Progress value={coachAdvice.confidenceScore} className="h-2 mt-1 [&>div]:bg-neon max-w-xs mx-auto" />
              </div>
            </div>

            {coachAdvice.keyReasoningFactors && coachAdvice.keyReasoningFactors.length > 0 && (
              <InfoCard icon={<ListChecks className="h-5 w-5" />} title="Key Reasoning Factors">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Factor</TableHead>
                      <TableHead className="text-xs">Observation</TableHead>
                      <TableHead className="text-center text-xs">Impact</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {coachAdvice.keyReasoningFactors.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-xs py-1.5">{item.factor}</TableCell>
                        <TableCell className="text-xs py-1.5">{item.value}</TableCell>
                        <TableCell className="text-center py-1.5"><FactorImpactIcon impact={item.impact} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </InfoCard>
            )}

            <InfoCard icon={<FileText className="h-5 w-5" />} title="Detailed Analysis">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{coachAdvice.detailedAnalysis}</p>
            </InfoCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoCard icon={<TrendingUp className="h-5 w-5" />} title="Future Price Outlook">
                     <StatItem label="Short-Term Target" value={coachAdvice.futurePriceOutlook?.shortTermTarget} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                     <StatItem label="Mid-Term Target" value={coachAdvice.futurePriceOutlook?.midTermTarget} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                     <StatItem label="Long-Term Target" value={coachAdvice.futurePriceOutlook?.longTermTarget} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                </InfoCard>
                <InfoCard icon={<Target className="h-5 w-5" />} title="Suggested Trading Targets">
                    <StatItem label={<TradingTargetLabel label="Entry Point" tooltip="The suggested price or price range at which to consider buying the coin." />} value={coachAdvice.tradingTargets?.entryPoint} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                    <StatItem label={<TradingTargetLabel label="Stop-Loss" tooltip="A pre-set price at which to sell the coin to limit potential losses if the price moves unfavorably." />} value={coachAdvice.tradingTargets.stopLoss} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                    <StatItem label={<TradingTargetLabel label="Take Profit 1" tooltip="First suggested price level at which to consider selling a portion of your holdings to secure profits." />} value={coachAdvice.tradingTargets.takeProfit1} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>
                    {coachAdvice.tradingTargets.takeProfit2 && <StatItem label={<TradingTargetLabel label="Take Profit 2" tooltip="Second suggested price level for securing further profits." />} value={coachAdvice.tradingTargets.takeProfit2} className="px-0 py-1" labelClassName="text-xs" valueClassName="text-sm"/>}
                    {coachAdvice.tradingTargets.takeProfit3 && <StatItem label={<TradingTargetLabel label="Take Profit 3" tooltip="Third suggested price level for securing additional profits." />} value={coachAdvice.tradingTargets.takeProfit3} className="px-0 py-1 rounded-b-md" labelClassName="text-xs" valueClassName="text-sm"/>}
                </InfoCard>
            </div>

            <InfoCard icon={<Briefcase className="h-5 w-5" />} title="Investment Advice">
              <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{coachAdvice.investmentAdvice}</p>
            </InfoCard>

            {coachAdvice.eventBasedTriggers && coachAdvice.eventBasedTriggers.length > 0 && (
              <InfoCard icon={<CalendarClock className="h-5 w-5" />} title="AI Event-Based Triggers & Conditional Strategies">
                <div className="space-y-4">
                  {coachAdvice.eventBasedTriggers.map((trigger, index) => (
                    <Card key={index} className="bg-card/50 p-3 shadow-inner">
                      <h5 className="text-sm font-semibold text-primary mb-1 flex items-center">
                        <Zap className="h-4 w-4 mr-2 text-neon"/>
                        {trigger.eventName}
                      </h5>
                      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Condition:</span> {trigger.triggerCondition}</p>
                      <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/80">Action:</span> {trigger.recommendedAction}</p>
                      {trigger.rationale && <p className="text-xs text-muted-foreground/80 mt-1 italic"><span className="font-medium text-foreground/80">Rationale:</span> {trigger.rationale}</p>}
                    </Card>
                  ))}
                </div>
              </InfoCard>
            )}

            {coachAdvice.tradingSessionInsights && (
              <InfoCard icon={<Clock4 className="h-5 w-5" />} title="Trading Session Insights">
                <p className="text-base sm:text-sm text-muted-foreground whitespace-pre-wrap">{coachAdvice.tradingSessionInsights}</p>
              </InfoCard>
            )}

            {coachAdvice.disclaimer && (
              <p className="text-xs text-muted-foreground pt-4 border-t border-dashed mt-4">{coachAdvice.disclaimer}</p>
            )}
          </div>
        )}

        {threatRadarLoading && !threatRadarData && coachAdvice && (
             <div className="mt-8 text-center">
                <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Scanning On-Chain Threats...</p>
            </div>
        )}
        {threatRadarError && coachAdvice && (
             <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Threat Radar Error</AlertTitle>
                <AlertDescription>{threatRadarError}</AlertDescription>
            </Alert>
        )}
        {threatRadarData && !threatRadarLoading && coachAdvice && (
            <Card className="mt-8 shadow-md border-primary/50">
                <CardHeader>
                    <CardTitle className="flex items-center text-xl text-neon">
                        <Siren className="mr-2 h-5 w-5"/> On-Chain Threat Radar
                    </CardTitle>
                    <CardDescription>AI-simulated on-chain risk indicators for {threatRadarData.coinName}.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="text-center">
                        <span className="text-sm font-medium text-muted-foreground">Overall Threat Level: </span>
                        <Badge className={`px-3 py-1 text-sm ${getThreatLevelBadgeClasses(threatRadarData.riskLevel, threatRadarData.isHighRugRisk)}`}>
                            {threatRadarData.isHighRugRisk ? "High Rug Risk" : threatRadarData.riskLevel || "N/A"}
                        </Badge>
                         <p className="text-xs text-muted-foreground mt-1">Assessed on: {new Date(threatRadarData.assessmentDate).toLocaleDateString()}</p>
                    </div>

                    {threatRadarData.isHighRugRisk && (
                        <Alert variant="destructive" className="border-2 border-red-700">
                            <Siren className="h-5 w-5 text-red-700" />
                            <AlertTitle className="text-red-700 font-bold">High Rug Risk Detected!</AlertTitle>
                            <AlertDescription className="text-red-600">
                                {threatRadarData.rugPullWarningSummary || "AI has flagged this coin as having multiple indicators associated with high rug pull risk. Extreme caution advised."}
                            </AlertDescription>
                        </Alert>
                    )}

                    <StatItem label="Liquidity Lock" value={threatRadarData.liquidityLockStatus || "N/A"} className="!py-1" labelClassName="text-xs" valueClassName="text-xs"/>
                    <StatItem label="Dev Wallet/Holder Concentration" value={threatRadarData.devWalletConcentration || "N/A"} className="!py-1" labelClassName="text-xs" valueClassName="text-xs"/>
                    <StatItem label="Contract Verified" value={threatRadarData.contractVerified === undefined ? "N/A" : threatRadarData.contractVerified ? "Yes" : "No"} className="!py-1" labelClassName="text-xs" valueClassName="text-xs"/>
                    <StatItem label="Honeypot Signs" value={threatRadarData.honeypotIndicators || "N/A"} className="!py-1" labelClassName="text-xs" valueClassName="text-xs"/>

                    {threatRadarData.overallAssessment && (
                        <div>
                            <h4 className="font-semibold text-sm text-primary mb-1">AI Assessment Summary:</h4>
                            <p className="text-xs text-muted-foreground bg-muted/20 p-2 rounded-md whitespace-pre-wrap">{threatRadarData.overallAssessment}</p>
                        </div>
                    )}
                    {threatRadarData.disclaimer && (
                        <p className="text-xs text-muted-foreground pt-3 border-t border-dashed mt-3">{threatRadarData.disclaimer}</p>
                    )}
                </CardContent>
            </Card>
        )}

        <Separator className="my-8"/>
        <Card className="shadow-md border-primary/50">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-neon">
                    <SlidersHorizontal className="mr-2 h-5 w-5"/> AI What-If Scenario Simulator
                </CardTitle>
                <CardDescription>
                    Explore how the AI Coach might adjust its strategy under hypothetical market conditions for {coinName ? `"${coinName.trim()}"` : "the selected coin"}.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="coach-hypotheticalPrice">Hypothetical Price (USD)</Label>
                    <Input
                        id="coach-hypotheticalPrice"
                        type="number"
                        step="any"
                        placeholder="e.g., 0.50"
                        value={hypotheticalPrice}
                        onChange={(e) => setHypotheticalPrice(e.target.value)}
                        disabled={isLoadingWhatIf || !coinName.trim()}
                        className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="coach-hypotheticalVolume">Hypothetical Volume Condition</Label>
                    <Input
                        id="coach-hypotheticalVolume"
                        type="text"
                        placeholder="e.g., 'volume triples', 'halves', '+100%'"
                        value={hypotheticalVolumeCondition}
                        onChange={(e) => setHypotheticalVolumeCondition(e.target.value)}
                        disabled={isLoadingWhatIf || !coinName.trim()}
                        className="mt-1"
                    />
                </div>
                <Button
                    onClick={handleSimulateWhatIf}
                    disabled={isLoadingWhatIf || !coinName.trim() || !hypotheticalPrice.trim() || !hypotheticalVolumeCondition.trim()}
                    className="w-full"
                >
                    {isLoadingWhatIf ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    Simulate Scenario
                </Button>

                {whatIfError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>What-If Scenario Error</AlertTitle>
                        <AlertDescription>{whatIfError}</AlertDescription>
                    </Alert>
                )}

                {whatIfSignal && !isLoadingWhatIf && (
                    <div className="mt-6 space-y-4 p-4 border border-dashed border-primary/30 rounded-lg bg-muted/20">
                        <h4 className="text-lg font-semibold text-primary text-center">
                            What-If Scenario Analysis for {coinName.trim().toUpperCase()}
                        </h4>
                        <p className="text-sm text-muted-foreground text-center -mt-2">{whatIfSignal.scenarioDescription}</p>

                        <div className="flex flex-col items-center space-y-1 text-center">
                            <Badge variant={getRecommendationBadgeVariant(whatIfSignal.recommendation)} className="text-md px-3 py-1 font-semibold">
                                {whatIfSignal.recommendation}
                            </Badge>
                            <div>
                                <span className="text-xs font-medium text-foreground">Scenario Confidence: {whatIfSignal.confidenceScore}%</span>
                                <Progress value={whatIfSignal.confidenceScore} className="h-1.5 mt-0.5 [&>div]:bg-neon max-w-[150px] mx-auto" />
                            </div>
                        </div>

                        <InfoCard icon={<MessageSquare className="h-5 w-5"/>} title="Scenario Analysis & Strategy">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{whatIfSignal.analysisAndStrategy}</p>
                        </InfoCard>

                        {whatIfSignal.keyConsiderations && whatIfSignal.keyConsiderations.length > 0 && (
                            <InfoCard icon={<ListChecks className="h-5 w-5"/>} title="Key Considerations for This Scenario">
                                <ul className="list-disc list-inside space-y-1 pl-4 text-sm text-muted-foreground">
                                    {whatIfSignal.keyConsiderations.map((item, index) => (
                                        <li key={`whatif-consider-${index}`}>{item}</li>
                                    ))}
                                </ul>
                            </InfoCard>
                        )}
                        {whatIfSignal.disclaimer && (
                            <p className="text-xs text-muted-foreground pt-3 border-t border-dashed mt-3">{whatIfSignal.disclaimer}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>

        <Separator className="my-8"/>
         <Card className="shadow-md border-primary/50">
            <CardHeader>
                <CardTitle className="flex items-center text-xl text-neon">
                    <Percent className="mr-2 h-5 w-5"/> AI Future Profit Estimator
                </CardTitle>
                <CardDescription>
                    Estimate potential profit/loss for a hypothetical investment in {profitCalcCoinName ? `"${profitCalcCoinName}"` : "a coin"}.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleProfitCalcSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="profit-calc-coinName">Coin Name</Label>
                        <Input
                            id="profit-calc-coinName"
                            type="text"
                            placeholder="Defaults to main coach coin if set"
                            value={profitCalcCoinName}
                            onChange={(e) => setProfitCalcCoinName(e.target.value)}
                            disabled={isLoadingProfitCalc}
                            className="mt-1"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="profit-calc-buyPrice">Buy Price (USD)</Label>
                            <Input
                                id="profit-calc-buyPrice"
                                type="number"
                                step="any"
                                placeholder="e.g., 0.15"
                                value={buyPrice}
                                onChange={(e) => setBuyPrice(e.target.value)}
                                disabled={isLoadingProfitCalc}
                                className="mt-1"
                                required
                            />
                        </div>
                         <div>
                            <Label htmlFor="profit-calc-quantity">Quantity Purchased</Label>
                            <Input
                                id="profit-calc-quantity"
                                type="number"
                                step="any"
                                placeholder="e.g., 1000"
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                disabled={isLoadingProfitCalc}
                                className="mt-1"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="profit-calc-targetPrice">Future Target Price (USD)</Label>
                        <Input
                            id="profit-calc-targetPrice"
                            type="number"
                            step="any"
                            placeholder="e.g., 0.30"
                            value={targetPrice}
                            onChange={(e) => setTargetPrice(e.target.value)}
                            disabled={isLoadingProfitCalc}
                            className="mt-1"
                            required
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoadingProfitCalc || !profitCalcCoinName.trim() || !buyPrice.trim() || !quantity.trim() || !targetPrice.trim()}
                        className="w-full"
                    >
                        {isLoadingProfitCalc ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Calculate & Analyze
                    </Button>
                </form>

                {profitCalcError && (
                    <Alert variant="destructive" className="mt-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Profit Calculation Error</AlertTitle>
                        <AlertDescription>{profitCalcError}</AlertDescription>
                    </Alert>
                )}
                {profitCalcResult && !isLoadingProfitCalc && (
                    <div className="mt-6 space-y-4 p-4 border border-dashed border-primary/30 rounded-lg bg-muted/20">
                        <h4 className="text-lg font-semibold text-primary text-center">
                            Profit Estimation for {profitCalcResult.coinName.toUpperCase()}
                        </h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <StatItem label="Buy Price" value={`$${profitCalcResult.buyPrice.toFixed(4)}`} className="bg-card/30 p-2 rounded"/>
                            <StatItem label="Quantity" value={profitCalcResult.quantity.toLocaleString()} className="bg-card/30 p-2 rounded"/>
                            <StatItem label="Target Price" value={`$${profitCalcResult.targetPrice.toFixed(4)}`} className="bg-card/30 p-2 rounded"/>
                            <StatItem label="Total Investment" value={`$${profitCalcResult.totalInvestmentUSD.toFixed(2)}`} className="bg-card/30 p-2 rounded"/>
                            <StatItem label="Value at Target" value={`$${profitCalcResult.totalValueAtTargetUSD.toFixed(2)}`} className="bg-card/30 p-2 rounded"/>
                            <StatItem 
                                label="Net Profit/Loss" 
                                value={`${profitCalcResult.netProfitOrLossUSD >= 0 ? '+' : ''}$${profitCalcResult.netProfitOrLossUSD.toFixed(2)}`} 
                                valueClassName={profitCalcResult.netProfitOrLossUSD >= 0 ? "text-green-400" : "text-red-400"}
                                className="bg-card/30 p-2 rounded col-span-2 sm:col-span-1 font-bold"
                            />
                             <StatItem 
                                label="ROI" 
                                value={`${profitCalcResult.roiPercentage.toFixed(2)}%`} 
                                valueClassName={profitCalcResult.roiPercentage >= 0 ? "text-green-400" : "text-red-400"}
                                className="bg-card/30 p-2 rounded col-span-2 sm:col-span-1 font-bold"
                            />
                        </div>
                         <InfoCard icon={<MessageSquare className="h-5 w-5"/>} title="AI Realism Commentary">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profitCalcResult.realismCommentary}</p>
                        </InfoCard>
                         <InfoCard icon={<ShieldCheck className="h-5 w-5"/>} title="AI Risk Analysis">
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{profitCalcResult.riskAnalysis}</p>
                        </InfoCard>
                        {profitCalcResult.disclaimer && (
                            <p className="text-xs text-muted-foreground pt-3 border-t border-dashed mt-3">{profitCalcResult.disclaimer}</p>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>


         {(!isLoading && !threatRadarLoading) && !coachAdvice && !whatIfSignal && !profitCalcResult && !error && !whatIfError && !profitCalcError && (
            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center bg-muted/10 mt-6">
                <GraduationCap className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Enter a coin name and select a trading style above to get personalized AI coaching and its on-chain threat assessment, or simulate a What-If scenario or estimate future profits.</p>
            </div>
        )}
      </CardContent>
      <CardFooter className="mt-auto pt-4">
         <p className="text-xs text-muted-foreground">
           AI Coach advice, Threat Radar, What-If Scenarios, and Profit Estimations are for informational purposes only and not financial advice. Always DYOR.
         </p>
      </CardFooter>
    </Card>
  );
}

interface InfoCardProps {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}
const InfoCard: React.FC<InfoCardProps> = ({icon, title, children}) => (
    <Card className="bg-card shadow-sm">
        <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-lg text-primary flex items-center">
                {React.cloneElement(icon as React.ReactElement, { className: "mr-2 h-5 w-5" })} 
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

