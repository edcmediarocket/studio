
'use server';
/**
 * @fileOverview An AI agent that provides a trading signal (buy/sell/hold), detailed analysis, price targets, and investment advice for a specific meme coin, considering its current price and user's trading style.
 *
 * - getCoinTradingSignal - A function that provides the trading signal and analysis.
 * - GetCoinTradingSignalInput - The input type.
 * - GetCoinTradingSignalOutput - The return type.
 */

import {ai}from '@/ai/genkit';
import {z} from 'genkit';

const TradingStyleEnum = z.enum([
  "Conservative", 
  "Swing Trader", 
  "Scalper", 
  "High-Risk/High-Reward", 
  "AI Hybrid"
]).describe("The user's selected trading style to tailor the advice.");

const GetCoinTradingSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to get a trading signal for (e.g., Dogecoin).'),
  currentPriceUSD: z.number().optional().describe('The current market price of the coin in USD. If provided, this price MUST be used as a reference for all analysis and target prices.'),
  tradingStyle: TradingStyleEnum.optional().describe("The user's preferred trading style. Tailor advice accordingly."),
});
export type GetCoinTradingSignalInput = z.infer<typeof GetCoinTradingSignalInputSchema>;

const GetCoinTradingSignalOutputSchema = z.object({
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The trading recommendation: Buy, Sell, or Hold.'),
  reasoning: z.string().describe('A concise summary of the main reason for the recommendation.'),
  confidenceScore: z.number().min(0).max(100).int().describe('A numerical confidence score (0-100) for the generated signal. Higher means more confident.'),
  keyReasoningFactors: z.array(z.object({
    factor: z.string().describe("The contributing factor, e.g., RSI, MACD, Social Sentiment, Whale Activity, Developer Activity, AI Forecast Agreement."),
    value: z.string().describe("The observed value or state of the factor, e.g., '68', 'Bullish Crossover', '73% Positive', '$3.2M Inflow', 'High'."),
    impact: z.enum(["Positive", "Negative", "Neutral"]).describe("The perceived impact of this factor on the signal (Positive, Negative, or Neutral towards the recommendation).")
  })).optional().describe("A breakdown of 3-5 key factors and their impact influencing the trading signal."),
  detailedAnalysis: z.string().describe('In-depth analysis of the factors influencing the signal. This should be a comprehensive summary reflecting analysis of market sentiment, technical indicators (including RSI, MACD, EMA trends, price breakouts, volume spikes), on-chain data, whale activity, and tokenomics, as if derived from a sophisticated AI model trained on extensive crypto datasets. If currentPriceUSD was provided, this analysis MUST reference it. This analysis should also reflect the chosen tradingStyle if provided.'),
  futurePriceOutlook: z.object({
    shortTermTarget: z.string().optional().describe('Speculative short-term price target (e.g., "$0.05 in 1 week", "0.1234 USD"). This MUST be a plausible value derived directly from currentPriceUSD if provided. Include indicative predictions for timeframes like 1h, 6h, or 24h if possible. Adjust aggressiveness based on tradingStyle.'),
    midTermTarget: z.string().optional().describe('Speculative mid-term price target (e.g., "$0.10 in 1-3 months", "1.50 USD"). This MUST be a plausible value derived directly from currentPriceUSD if provided. Include an indicative prediction for a timeframe like 7d if possible. Adjust aggressiveness based on tradingStyle.')
  }).describe('Speculative future price targets based on current analysis. If currentPriceUSD was provided, these targets MUST be scaled realistically from that price and influenced by the tradingStyle.'),
  tradingTargets: z.object({
    entryPoint: z.string().optional().describe('Suggested entry price range (e.g., "$0.040-$0.042", "0.038 USD"), if applicable for a "Buy" signal. MUST be a plausible value derived directly from currentPriceUSD if provided and tailored to the tradingStyle.'),
    stopLoss: z.string().describe('Suggested stop-loss price to limit potential losses (e.g., "$0.035", "0.030 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, or relative to entry point, and tailored to the tradingStyle (e.g., tighter for Scalper, wider for Conservative).'),
    takeProfit1: z.string().describe('First take-profit target price (e.g., "$0.055", "0.060 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, or relative to entry point, and tailored to the tradingStyle.'),
    takeProfit2: z.string().optional().describe('Second take-profit target price (e.g., "$0.065", "0.070 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, and tailored to the tradingStyle.'),
    takeProfit3: z.string().optional().describe('Third take-profit target price (e.g., "$0.075", "0.080 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, and tailored to the tradingStyle.')
  }).describe('Specific trading price targets for executing a trade. These MUST be scaled realistically based on currentPriceUSD if provided and heavily influenced by the selected tradingStyle.'),
  investmentAdvice: z.string().describe('Provide advanced and detailed investment advice or strategy for this coin based on the current signal, analysis, and the user\'s selected tradingStyle. This should include: \n1. Suggested portfolio allocation (e.g., "For a High-Risk/High-Reward style, consider this a 5-10% speculative play..." or "For a Conservative style, this might represent a 1-2% allocation..."). \n2. Specific entry/exit strategy nuances tailored to the tradingStyle (e.g., "Scalpers might look for quick 1-2% gains with tight stops." or "Conservative investors could DCA around the entry point and aim for mid-term targets."). \n3. Key risk management techniques relevant to the signal and tradingStyle (e.g., "High-Risk traders must use firm stop-losses. Conservative traders might avoid this signal if broader market is bearish."). \n4. Conditions that might invalidate the current signal or warrant a re-evaluation, considering the tradingStyle. \n5. If "Hold", specify key metrics to monitor for a change in outlook based on the tradingStyle.'),
  disclaimer: z.string().default("This AI-generated trading signal and analysis is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.").describe("Standard disclaimer.")
});
export type GetCoinTradingSignalOutput = z.infer<typeof GetCoinTradingSignalOutputSchema>;

export async function getCoinTradingSignal(input: GetCoinTradingSignalInput): Promise<GetCoinTradingSignalOutput> {
  return getCoinTradingSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCoinTradingSignalPrompt',
  input: {schema: GetCoinTradingSignalInputSchema},
  output: {schema: GetCoinTradingSignalOutputSchema},
  prompt: `You are "Meme Prophet", a highly advanced AI model trained to identify high-potential meme coins and altcoins. Your analysis is based on simulating real-time market data, on-chain activity, social sentiment, and whale transactions.
For the meme coin "{{coinName}}"{{#if currentPriceUSD}}, which is currently trading at approximately {{{currentPriceUSD}}} USD{{/if}}, perform a comprehensive analysis.

{{#if tradingStyle}}
The user has selected the "{{{tradingStyle}}}" trading style. Your entire analysis, including entry points, stop-loss, take-profit targets, price outlook, and investment advice, MUST be tailored to this style.
- **Conservative**: Focus on lower risk, potentially wider stops, longer hold times, smaller position sizes, and clearer confirmations.
- **Swing Trader**: Focus on short-to-mid-term price movements, technical analysis, identifying swing highs/lows, with balanced risk/reward.
- **Scalper**: Focus on very short-term (intraday) micro-movements, tight stop-losses and take-profits, requiring high precision.
- **High-Risk/High-Reward**: Focus on momentum, hype, potentially higher volatility plays, with asymmetric upside but acknowledging significant risk.
- **AI Hybrid**: Explain how you are dynamically blending strategies based on current market conditions and coin characteristics.
{{else}}
No specific trading style was selected by the user. Provide a balanced, general-purpose trading analysis.
{{/if}}

**CRITICAL INSTRUCTIONS FOR PRICE TARGETS AND ANALYSIS (IF 'currentPriceUSD' IS PROVIDED):**
{{#if currentPriceUSD}}
1.  **Current Price Context**: The current market price for {{coinName}} is {{{currentPriceUSD}}} USD. This value is your ABSOLUTE reference.
2.  **Numerical Targets**: ALL your numerical price targets in 'futurePriceOutlook' (shortTermTarget, midTermTarget) and 'tradingTargets' (entryPoint, stopLoss, takeProfit1, takeProfit2, takeProfit3) MUST be plausible future values derived *directly* and *proportionally* from this {{{currentPriceUSD}}} USD. They must also reflect the chosen 'tradingStyle' if provided (e.g., tighter ranges for Scalper, potentially more ambitious targets for High-Risk).
    *   For example, if {{{currentPriceUSD}}} is $2.50, an entryPoint for a Swing Trader might be "$2.45", a stopLoss "$2.30", a takeProfit1 "$2.70". A Scalper might have an entry at $2.50, SL at $2.48, TP1 at $2.53.
    *   Your targets should NOT be in a drastically different order of magnitude (e.g., $0.000x or $5000 if current is $2.50) unless an EXTREME, well-justified event (consistent with the trading style) is described in the 'detailedAnalysis'.
    *   Think in terms of reasonable percentage changes from {{{currentPriceUSD}}}, adjusted for the selected 'tradingStyle'.
3.  **Detailed Analysis Reference**: Your 'detailedAnalysis' text MUST also reference and be consistent with this current price of {{{currentPriceUSD}}} USD when discussing current market standing or potential price movements.
{{else}}
**Note: No specific current market price was provided for {{coinName}}. Your analysis and price targets will be more general estimations and should reflect this lack of a precise current price. However, still tailor the *nature* of the targets and advice to the selected 'tradingStyle' if provided.**
{{/if}}

Imagine you have access to and have analyzed the following types of data:
- Historical price action, including identification of key support/resistance levels, potential price breakouts, and chart patterns.
- Volume spikes and trends, correlating them with price movements.
- Social media dynamics: Twitter/X trending topics, Telegram/Reddit mentions, and general sentiment shifts.
- Blockchain activity: Data from platforms like Ethereum, BSC, and Solana, including new/active wallets and specific whale trades (buys/sells and amounts).
- Technical Indicators: Including Moving Average Convergence Divergence (MACD), Relative Strength Index (RSI) (identifying overbought/oversold conditions), Exponential Moving Averages (EMA trends), and Bollinger Bands.
- News Sentiment: Overall bullish, bearish, or neutral sentiment from recent news.
- Behavioral Triggers: Indicators of FOMO (Fear Of Missing Out) or FUD (Fear, Uncertainty, Doubt) patterns.
- Developer Activity: Simulated or known developer activity.
- AI Forecast Agreement: Conceptual agreement with other AI forecasting models.

Based on your simulated multi-faceted analysis of these inputs, provide a trading signal for "{{coinName}}". Your response MUST adhere to the JSON output schema.

Ensure all output fields are populated:
1.  'recommendation': "Buy", "Sell", or "Hold".
2.  'reasoning': A concise (1-2 sentence) summary for the recommendation. This should briefly touch upon the key simulated data points (e.g., technicals like RSI/EMA, breakouts, volume, sentiment, whale activity) that led to the signal.
3.  'confidenceScore': An integer from 0 to 100 representing your confidence in this signal.
4.  'keyReasoningFactors': Provide 3-5 key factors that significantly influenced your signal. For each factor, specify:
    *   'factor': The name of the factor (e.g., "RSI (14D)", "Social Sentiment (Twitter)", "Whale Net Inflow (24h)").
    *   'value': The observed state or value (e.g., "68", "73% Positive", "$3.2M Inflow", "High").
    *   'impact': Its perceived impact on your signal recommendation ("Positive", "Negative", "Neutral").
5.  'detailedAnalysis': A comprehensive explanation. Articulate how the simulated factors (historical price, volume spikes, price breakouts, social media, on-chain activity, whale movements, technical indicators like MACD/RSI/EMA trends/Bollinger Bands, news sentiment, FOMO/FUD patterns, tokenomics{{#if currentPriceUSD}}, and the current price of {{{currentPriceUSD}}} USD{{/if}}) contribute to your recommendation. Be specific in your rationale. **This analysis must align with the selected 'tradingStyle'.**
6.  'futurePriceOutlook': (shortTermTarget, midTermTarget) - These MUST be scaled from currentPriceUSD if provided and reflect the 'tradingStyle'.
7.  'tradingTargets': (entryPoint, stopLoss, takeProfit1, takeProfit2, takeProfit3) - These MUST be scaled from currentPriceUSD if provided and reflect the 'tradingStyle'.
8.  'investmentAdvice': Provide advanced and detailed investment advice as per the schema description, **explicitly tailored to the selected 'tradingStyle'**. It should cover portfolio allocation, entry/exit nuances, risk management, invalidation conditions, and what to monitor for "Hold" signals, all through the lens of the chosen style.
9.  'disclaimer': The standard disclaimer.

Your goal is to explain your rationale clearly, as if drawing conclusions from the rich (simulated) dataset described, emphasizing technical indicators like RSI, EMA trends, price breakouts, and volume spikes where relevant.
Strictly adhere to scaling all price targets from the provided 'currentPriceUSD' and tailoring all advice to the 'tradingStyle' if provided.
`,
});

const getCoinTradingSignalFlow = ai.defineFlow(
  {
    name: 'getCoinTradingSignalFlow',
    inputSchema: GetCoinTradingSignalInputSchema,
    outputSchema: GetCoinTradingSignalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This AI-generated trading signal and analysis is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.";
    }
    return output!;
  }
);

