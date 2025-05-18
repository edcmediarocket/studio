
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
  detailedAnalysis: z.string().describe('In-depth analysis of the factors influencing the signal, including technical and fundamental aspects if applicable for a meme coin (e.g., market sentiment, recent news, tokenomics, chart patterns).'),
  futurePriceOutlook: z.object({
    shortTermTarget: z.string().optional().describe('Speculative short-term price target (e.g., "$0.05 in 1 week").'),
    midTermTarget: z.string().optional().describe('Speculative mid-term price target (e.g., "$0.10 in 1-3 months").')
  }).describe('Speculative future price targets based on current analysis.'),
  tradingTargets: z.object({
    entryPoint: z.string().optional().describe('Suggested entry price range (e.g., "$0.040-$0.042").'),
    stopLoss: z.string().describe('Suggested stop-loss price to limit potential losses (e.g., "$0.035").'),
    takeProfit1: z.string().describe('First take-profit target price (e.g., "$0.055").'),
    takeProfit2: z.string().optional().describe('Second take-profit target price (e.g., "$0.065").'),
    takeProfit3: z.string().optional().describe('Third take-profit target price (e.g., "$0.075").')
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
  prompt: `You are an expert AI crypto analyst providing comprehensive trading signals and investment advice for meme coins.
For the coin "{{coinName}}", provide a clear trading recommendation, detailed analysis, speculative price targets, specific trading targets, and investment advice.

Your response must adhere to the JSON output schema.

Consider factors like:
- Current market sentiment (social media buzz, news).
- Recent price action and basic technical indicators if discernible (e.g., support/resistance, volume trends).
- Tokenomics (supply, distribution, burn mechanisms if known).
- Upcoming events, partnerships, or catalysts.
- Overall risk profile of {{coinName}} and the broader meme coin market.

Specifically, provide:
1.  'recommendation': "Buy", "Sell", or "Hold".
2.  'reasoning': A concise (1-2 sentence) summary for the recommendation.
3.  'rocketScore': An integer from 1 to 5 indicating bullish potential (5 is most bullish).
4.  'detailedAnalysis': A thorough explanation of the factors (technical, fundamental, sentimental) driving your recommendation. Discuss why this is a buy/sell/hold.
5.  'futurePriceOutlook':
    *   'shortTermTarget': A speculative price target for the near future (e.g., next few days to a week), if one can be reasonably estimated.
    *   'midTermTarget': A speculative price target for the medium term (e.g., next few weeks to months), if one can be reasonably estimated.
6.  'tradingTargets':
    *   'entryPoint': A suggested price range for entering a trade if 'Buy'.
    *   'stopLoss': A crucial price level to exit and limit losses.
    *   'takeProfit1': The first price level to consider taking profits.
    *   'takeProfit2', 'takeProfit3': Optional subsequent take-profit levels.
7.  'investmentAdvice': Specific guidance on how one might approach investing in {{coinName}} based on your analysis (e.g., risk management, position sizing considerations, conditions to watch for).
8.  'disclaimer': The standard disclaimer.

Ensure your analysis is as insightful as possible for a speculative asset like a meme coin. If data is scarce or a factor is not applicable, state that.
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

