
'use server';
/**
 * @fileOverview An AI agent that provides a trading signal (buy/sell/hold), detailed analysis, price targets, and investment advice for a specific meme coin, considering its current price.
 *
 * - getCoinTradingSignal - A function that provides the trading signal and analysis.
 * - GetCoinTradingSignalInput - The input type.
 * - GetCoinTradingSignalOutput - The return type.
 */

import {ai}from '@/ai/genkit';
import {z} from 'genkit';

const GetCoinTradingSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to get a trading signal for (e.g., Dogecoin).'),
  currentPriceUSD: z.number().optional().describe('The current market price of the coin in USD. If provided, this price MUST be used as a reference for all analysis and target prices.'),
});
export type GetCoinTradingSignalInput = z.infer<typeof GetCoinTradingSignalInputSchema>;

const GetCoinTradingSignalOutputSchema = z.object({
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The trading recommendation: Buy, Sell, or Hold.'),
  reasoning: z.string().describe('A concise summary of the main reason for the recommendation.'),
  rocketScore: z.number().min(1).max(5).int().describe('A score from 1 to 5 rockets, indicating bullish potential or strength of the signal. 5 is highest. This also reflects the AI\'s confidence.'),
  detailedAnalysis: z.string().describe('In-depth analysis of the factors influencing the signal. This should be a comprehensive summary reflecting analysis of market sentiment, technical indicators (including RSI, MACD, EMA trends, price breakouts, volume spikes), on-chain data, whale activity, and tokenomics, as if derived from a sophisticated AI model trained on extensive crypto datasets. If currentPriceUSD was provided, this analysis MUST reference it.'),
  futurePriceOutlook: z.object({
    shortTermTarget: z.string().optional().describe('Speculative short-term price target (e.g., "$0.05 in 1 week", "0.1234 USD"). This should be relative to the current price. Include indicative predictions for timeframes like 1h, 6h, or 24h if possible.'),
    midTermTarget: z.string().optional().describe('Speculative mid-term price target (e.g., "$0.10 in 1-3 months", "1.50 USD"). This should be relative to the current price. Include an indicative prediction for a timeframe like 7d if possible.')
  }).describe('Speculative future price targets based on current analysis. If currentPriceUSD was provided, these targets MUST be scaled realistically from that price.'),
  tradingTargets: z.object({
    entryPoint: z.string().optional().describe('Suggested entry price range (e.g., "$0.040-$0.042", "0.038 USD"), if applicable for a "Buy" signal. MUST be relative to currentPriceUSD if provided.'),
    stopLoss: z.string().describe('Suggested stop-loss price to limit potential losses (e.g., "$0.035", "0.030 USD"). MUST be relative to currentPriceUSD if provided, or relative to entry point.'),
    takeProfit1: z.string().describe('First take-profit target price (e.g., "$0.055", "0.060 USD"). MUST be relative to currentPriceUSD if provided, or relative to entry point.'),
    takeProfit2: z.string().optional().describe('Second take-profit target price (e.g., "$0.065", "0.070 USD"). MUST be relative to currentPriceUSD if provided.'),
    takeProfit3: z.string().optional().describe('Third take-profit target price (e.g., "$0.075", "0.080 USD"). MUST be relative to currentPriceUSD if provided.')
  }).describe('Specific trading price targets for executing a trade. These MUST be scaled realistically based on currentPriceUSD if provided.'),
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
  prompt: `You are "Meme Prophet", a highly advanced AI model trained to identify high-potential meme coins and altcoins. Your analysis is based on simulating real-time market data, on-chain activity, social sentiment, and whale transactions.
For the meme coin "{{coinName}}"{{#if currentPriceUSD}}, which is currently trading at approximately {{{currentPriceUSD}}} USD{{/if}}, perform a comprehensive analysis.

{{#if currentPriceUSD}}
**CRITICAL: The current market price for {{coinName}} is {{{currentPriceUSD}}} USD. ALL your numerical price targets ('futurePriceOutlook', 'tradingTargets') MUST be plausible future values derived *directly* from this {{{currentPriceUSD}}} USD. For example, if current price is $2.50, targets should be in a similar dollar range (e.g., entry $2.45, SL $2.30, TP1 $2.70), not $0.000x or $5000, unless an extreme, well-justified event is described in the analysis. Your 'detailedAnalysis' MUST also reference this current price.**
{{else}}
**Note: No specific current market price was provided for {{coinName}}. Your analysis and price targets will be more general estimations.**
{{/if}}

Imagine you have access to and have analyzed the following types of data:
- Historical price action, including identification of key support/resistance levels, potential price breakouts, and chart patterns.
- Volume spikes and trends, correlating them with price movements.
- Social media dynamics: Twitter/X trending topics, Telegram/Reddit mentions, and general sentiment shifts.
- Blockchain activity: Data from platforms like Ethereum, BSC, and Solana, including new/active wallets and specific whale trades (buys/sells and amounts).
- Technical Indicators: Including Moving Average Convergence Divergence (MACD), Relative Strength Index (RSI) (identifying overbought/oversold conditions), Exponential Moving Averages (EMA trends), and Bollinger Bands.
- News Sentiment: Overall bullish, bearish, or neutral sentiment from recent news.
- Behavioral Triggers: Indicators of FOMO (Fear Of Missing Out) or FUD (Fear, Uncertainty, Doubt) patterns.

Based on your simulated multi-faceted analysis of these inputs, provide a trading signal for "{{coinName}}". Your response MUST adhere to the JSON output schema.

Ensure all output fields are populated:
1.  'recommendation': "Buy", "Sell", or "Hold".
2.  'reasoning': A concise (1-2 sentence) summary for the recommendation. This should briefly touch upon the key simulated data points (e.g., technicals like RSI/EMA, breakouts, volume, sentiment, whale activity) that led to the signal.
3.  'rocketScore': An integer from 1 to 5. This score indicates bullish potential (5 is most bullish) AND your confidence level in the signal (5 is most confident).
4.  'detailedAnalysis': A comprehensive explanation. Articulate how the simulated factors (historical price, volume spikes, price breakouts, social media, on-chain activity, whale movements, technical indicators like MACD/RSI/EMA trends/Bollinger Bands, news sentiment, FOMO/FUD patterns, tokenomics{{#if currentPriceUSD}}, and the current price of {{{currentPriceUSD}}} USD{{/if}}) contribute to your recommendation. Be specific in your rationale.
5.  'futurePriceOutlook':
    *   'shortTermTarget': A speculative short-term price target string (e.g., "$0.05", "0.1234 USD"). If possible, provide indicative predictions for timeframes like 1h, 6h, or 24h within this field or the detailedAnalysis.
    *   'midTermTarget': A speculative mid-term price target string (e.g., "$0.10", "1.50 USD"). If possible, provide an indicative prediction for a timeframe like 7d within this field or the detailedAnalysis.
6.  'tradingTargets': All targets should be sensible given the current price {{#if currentPriceUSD}}{{{currentPriceUSD}}} USD{{else}}(if known){{/if}}.
    *   'entryPoint': Suggested price range (e.g., "$0.040-$0.042", "0.038 USD") for entering a trade if 'Buy'.
    *   'stopLoss': Suggested stop-loss price (e.g., "$0.035", "0.030 USD").
    *   'takeProfit1': First take-profit target price (e.g., "$0.055", "0.060 USD").
    *   'takeProfit2', 'takeProfit3': Optional subsequent take-profit levels.
7.  'investmentAdvice': Specific investment advice or strategy for this coin based on the current signal and analysis.
8.  'disclaimer': The standard disclaimer.

Your goal is to explain your rationale clearly, as if drawing conclusions from the rich (simulated) dataset described, emphasizing technical indicators like RSI, EMA trends, price breakouts, and volume spikes where relevant.
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

