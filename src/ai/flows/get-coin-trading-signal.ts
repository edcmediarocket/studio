
'use server';
/**
 * @fileOverview An AI agent that provides a trading signal (buy/sell/hold), detailed analysis, price targets, and investment advice for a specific meme coin.
 *
 * - getCoinTradingSignal - A function that provides the trading signal and analysis.
 * - GetCoinTradingSignalInput - The input type.
 * - GetCoinTradingSignalOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCoinTradingSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to get a trading signal for (e.g., Dogecoin).'),
});
export type GetCoinTradingSignalInput = z.infer<typeof GetCoinTradingSignalInputSchema>;

const GetCoinTradingSignalOutputSchema = z.object({
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The trading recommendation: Buy, Sell, or Hold.'),
  reasoning: z.string().describe('A concise summary of the main reason for the recommendation.'),
  rocketScore: z.number().min(1).max(5).int().describe('A score from 1 to 5 rockets, indicating bullish potential or strength of the signal. 5 is highest.'),
  detailedAnalysis: z.string().describe('In-depth analysis of the factors influencing the signal. This should be a comprehensive summary reflecting analysis of market sentiment, technical indicators, on-chain data, whale activity, and tokenomics, as if derived from a sophisticated AI model trained on extensive crypto datasets.'),
  futurePriceOutlook: z.object({
    shortTermTarget: z.string().optional().describe('Speculative short-term price target (e.g., "$0.05 in 1 week", "0.1234 USD").'),
    midTermTarget: z.string().optional().describe('Speculative mid-term price target (e.g., "$0.10 in 1-3 months", "1.50 USD").')
  }).describe('Speculative future price targets based on current analysis.'),
  tradingTargets: z.object({
    entryPoint: z.string().optional().describe('Suggested entry price range (e.g., "$0.040-$0.042", "0.038 USD").'),
    stopLoss: z.string().describe('Suggested stop-loss price to limit potential losses (e.g., "$0.035", "0.030 USD").'),
    takeProfit1: z.string().describe('First take-profit target price (e.g., "$0.055", "0.060 USD").'),
    takeProfit2: z.string().optional().describe('Second take-profit target price (e.g., "$0.065", "0.070 USD").'),
    takeProfit3: z.string().optional().describe('Third take-profit target price (e.g., "$0.075", "0.080 USD").')
  }).describe('Specific trading price targets for executing a trade.'),
  investmentAdvice: z.string().describe('Specific investment advice or strategy for this coin based on the current signal and analysis (e.g., "Consider allocating a small percentage of a speculative portfolio," or "Wait for confirmation of breakout before entering." ).'),
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
  prompt: `You are an advanced AI crypto signal engine, "Meme Prophet". Your analysis for the meme coin "{{coinName}}" should be comprehensive, simulating insights as if derived from a sophisticated training pipeline using the following data points:

Simulated Data Inputs (consider these conceptually):
- Real-time and historical price data (price_usd, price_change_pct_1h, price_change_pct_24h).
- Market fundamentals (volume_24h, market_cap, liquidity_score).
- Whale activity (whale_alerts_count, avg_whale_txn_value_usd).
- Social sentiment (social_sentiment_score from Twitter/Reddit, mentions_count).
- On-chain metrics (onchain_txn_count_24h, unique_wallets_24h).
- Smart contract integrity (contract_risk_score).
- Technical indicators (RSI, MACD, EMA12/26, Bollinger Bands within a 'technicals' JSON object).

Based on a simulated multi-faceted analysis of these inputs, provide a trading signal for "{{coinName}}". Your response MUST adhere to the JSON output schema.

Specifically, in your 'detailedAnalysis' field, articulate how these simulated factors (market conditions, sentiment, on-chain activity, whale movements, technicals, and tokenomics) contribute to your overall recommendation. For instance, you might state: "Current social sentiment score is X, indicating Y, while on-chain unique wallet activity shows Z. Technicals (RSI at A, MACD crossover B) suggest C."

Ensure all output fields are populated:
1.  'recommendation': "Buy", "Sell", or "Hold".
2.  'reasoning': A concise (1-2 sentence) summary for the recommendation.
3.  'rocketScore': An integer from 1 to 5 indicating bullish potential (5 is most bullish).
4.  'detailedAnalysis': A comprehensive explanation synthesizing the simulated analysis of the above-mentioned data categories.
5.  'futurePriceOutlook':
    *   'shortTermTarget': A speculative price target for the near future (e.g., "$0.05 in 1 week").
    *   'midTermTarget': A speculative price target for the medium term (e.g., "$0.10 in 1-3 months").
6.  'tradingTargets':
    *   'entryPoint': Suggested price range for entering a trade if 'Buy'.
    *   'stopLoss': Crucial price level to limit losses.
    *   'takeProfit1': First price level for profit-taking.
    *   'takeProfit2', 'takeProfit3': Optional subsequent take-profit levels.
7.  'investmentAdvice': Specific guidance (e.g., risk management, position sizing, conditions to watch).
8.  'disclaimer': The standard disclaimer.

When providing price targets, entry points, stop-loss, or take-profit levels, ensure they are specific numerical currency values (e.g., '$0.1234', '1.50 USD').
Your analysis should be insightful and actionable, reflecting the sophistication of a highly trained AI model, even while generating text for a speculative asset like a meme coin. If specific data points would be scarce for such a coin, reflect that in your simulated analysis by stating conservative estimates or acknowledging data limitations.
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

