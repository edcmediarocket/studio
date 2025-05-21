
'use server';
/**
 * @fileOverview Provides an AI-generated entry zone status for a meme coin.
 *
 * - getEntryZoneStatus - A function that returns the entry zone status.
 * - GetEntryZoneStatusInput - The input type.
 * - GetEntryZoneStatusOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetEntryZoneStatusInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin).'),
  currentMarketCap: z.number().optional().describe('The current market capitalization of the coin in USD, if available.'),
  currentPrice: z.number().optional().describe('The current price of the coin in USD, if available.'),
});
export type GetEntryZoneStatusInput = z.infer<typeof GetEntryZoneStatusInputSchema>;

const EntryZoneStatusEnum = z.enum([
    "Early Entry Zone",
    "Neutral Zone",
    "Caution: Overheated",
    "Monitor Closely",
    "Potential Breakout Imminent",
    "Accumulation Phase"
]);

const GetEntryZoneStatusOutputSchema = z.object({
  status: EntryZoneStatusEnum.describe('The AI-assessed entry zone status for the coin.'),
  reasoning: z.string().describe('A brief explanation for the assessed status, considering simulated factors like market cap, price trends, and RSI.'),
  confidence: z.enum(["High", "Medium", "Low"]).describe("AI's confidence in this assessment."),
  disclaimer: z.string().default("This entry zone status is AI-generated, highly speculative, and not financial advice. Market conditions for meme coins can change rapidly. DYOR."),
});
export type GetEntryZoneStatusOutput = z.infer<typeof GetEntryZoneStatusOutputSchema>;

export async function getEntryZoneStatus(input: GetEntryZoneStatusInput): Promise<GetEntryZoneStatusOutput> {
  return getEntryZoneStatusFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getEntryZoneStatusPrompt',
  input: {schema: GetEntryZoneStatusInputSchema},
  output: {schema: GetEntryZoneStatusOutputSchema},
  prompt: `You are an AI market analyst specializing in meme coin entry points.
For the coin "{{coinName}}"
{{#if currentMarketCap}}with a current market cap around \${{{currentMarketCap}}}{{/if}}
{{#if currentPrice}}and a current price around \${{{currentPrice}}}{{/if}},
assess its current entry zone status.

Simulate an analysis considering factors such as:
- Its market capitalization category (e.g., very low, low, mid).
- Conceptual price trends (e.g., recently bottomed, consolidating, rising steadily, parabolic rise).
- Simulated RSI levels (e.g., oversold, neutral, overbought).
- Recent significant news or social media hype.

Based on this simulated analysis, determine the 'status' from the available enum options (e.g., "Early Entry Zone", "Neutral Zone", "Caution: Overheated", "Monitor Closely", "Potential Breakout Imminent", "Accumulation Phase").
Provide 'reasoning' for your assessment and your 'confidence' level.
Always include the 'disclaimer'.
`,
});

const getEntryZoneStatusFlow = ai.defineFlow(
  {
    name: 'getEntryZoneStatusFlow',
    inputSchema: GetEntryZoneStatusInputSchema,
    outputSchema: GetEntryZoneStatusOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This entry zone status is AI-generated, highly speculative, and not financial advice. Market conditions for meme coins can change rapidly. DYOR.";
    }
    return output!;
  }
);
