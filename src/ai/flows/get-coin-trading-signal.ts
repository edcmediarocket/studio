
'use server';
/**
 * @fileOverview An AI agent that provides a trading signal (buy/sell/hold), reasoning, and a rocket score for a specific meme coin.
 *
 * - getCoinTradingSignal - A function that provides the trading signal.
 * - GetCoinTradingSignalInput - The input type.
 * - GetCoinTradingSignalOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GetCoinTradingSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to get a trading signal for (e.g., Dogecoin).'),
});
export type GetCoinTradingSignalInput = z.infer<typeof GetCoinTradingSignalInputSchema>;

export const GetCoinTradingSignalOutputSchema = z.object({
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The trading recommendation: Buy, Sell, or Hold.'),
  reasoning: z.string().describe('Detailed reasoning behind the recommendation, considering current market conditions, sentiment, and coin-specific factors.'),
  rocketScore: z.number().min(1).max(5).int().describe('A score from 1 to 5 rockets, indicating bullish potential or strength of the signal. 5 is highest.'),
  disclaimer: z.string().default("This AI-generated trading signal is for informational purposes only and not financial advice. DYOR.").describe("Standard disclaimer.")
});
export type GetCoinTradingSignalOutput = z.infer<typeof GetCoinTradingSignalOutputSchema>;

export async function getCoinTradingSignal(input: GetCoinTradingSignalInput): Promise<GetCoinTradingSignalOutput> {
  return getCoinTradingSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCoinTradingSignalPrompt',
  input: {schema: GetCoinTradingSignalInputSchema},
  output: {schema: GetCoinTradingSignalOutputSchema},
  prompt: `You are an expert AI crypto analyst providing trading signals for meme coins.
For the coin "{{coinName}}", provide a clear trading recommendation (Buy, Sell, or Hold), detailed reasoning, and a "rocket score" from 1 to 5 indicating bullish potential or signal strength (5 being the most bullish/strongest).

Consider factors like:
- Current market sentiment (social media, news).
- Recent price action and technical indicators (if generally applicable to meme coins).
- Tokenomics (if known and relevant).
- Upcoming events or catalysts.
- Overall risk in the meme coin market.

Your reasoning should be concise but informative. The rocket score should reflect your overall assessment.
Always include the disclaimer.
Format your output as JSON according to the schema.
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
      output.disclaimer = "This AI-generated trading signal is for informational purposes only and not financial advice. DYOR.";
    }
    return output!;
  }
);
