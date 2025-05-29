
'use server';
/**
 * @fileOverview An AI agent that provides strategic timing predictions for buying or selling a coin.
 *
 * - getStrategicCoinTiming - A function that provides strategic timing advice.
 * - StrategicCoinTimingInput - The input type.
 * - StrategicCoinTimingOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const StrategicCoinTimingInputSchema = z.object({
  coinName: z.string().describe('The name of the cryptocurrency to get strategic timing advice for (e.g., Dogecoin).'),
  currentPriceUSD: z.number().optional().describe('The current live market price of the coin in USD. If provided, this MUST be used as context for the analysis.'),
});
export type StrategicCoinTimingInput = z.infer<typeof StrategicCoinTimingInputSchema>;

const StrategicCoinTimingOutputSchema = z.object({
  coinName: z.string().describe('The name of the coin analyzed.'),
  predictedAction: z.enum([
      "Strong Buy Opportunity", 
      "Potential Favorable Entry Window",
      "Monitor for Entry Confirmation",
      "Potential Sell/Profit-Taking Window", 
      "Consider De-risking/Partial Exit",
      "Neutral - Hold and Observe"
    ]).describe('The AI-predicted strategic action based on timing.'),
  timingWindowEstimate: z
    .string()
    .describe('A descriptive estimate of the opportune timing window (e.g., "Next 4-8 hours, aligning with Asian market open", "During US market close if volatility persists", "Over the next 24-48 hours pending news release X").'),
  keyReasoning: z
    .string()
    .describe('Detailed reasoning for the predicted timing and action, based on simulated analysis of market cycles, volume patterns, potential catalysts, or inter-session liquidity shifts. If currentPriceUSD was provided, reference it in your reasoning.'),
  confidence: z
    .enum(['High', 'Medium', 'Low'])
    .describe("The AI's confidence level in this strategic timing prediction."),
  strategyNotes: z
    .string()
    .describe('Brief, actionable notes on how to approach this timing (e.g., "Look for volume confirmation before entry.", "Consider scaling in/out rather than a single transaction.", "Set tight stop-loss if entering during high volatility window.").'),
  disclaimer: z
    .string()
    .default('Strategic timing predictions are highly speculative and based on AI-simulated market analysis. Not financial advice. Always conduct your own research and manage risk carefully.')
    .describe('Standard disclaimer.'),
});
export type StrategicCoinTimingOutput = z.infer<typeof StrategicCoinTimingOutputSchema>;

export async function getStrategicCoinTiming(input: StrategicCoinTimingInput): Promise<StrategicCoinTimingOutput> {
  return getStrategicCoinTimingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getStrategicCoinTimingPrompt',
  input: {schema: StrategicCoinTimingInputSchema},
  output: {schema: StrategicCoinTimingOutputSchema},
  prompt: `You are an expert AI Crypto Strategist specializing in identifying opportune market timing for meme coins and altcoins.
For the coin "{{coinName}}"{{#if currentPriceUSD}}, which is currently trading at approximately {{{currentPriceUSD}}} USD{{/if}}, analyze its current (simulated) market position.

Consider factors like:
-   Recent price action and volatility patterns.
-   Typical volume behavior during different global trading sessions (Asian, European, US).
-   Potential upcoming (simulated) news, events, or catalysts that might influence timing.
-   Overall market sentiment and its potential impact on "{{coinName}}".
-   Possible accumulation or distribution phases based on conceptual on-chain signals or chart patterns.
{{#if currentPriceUSD}}
-   The provided current price of {{{currentPriceUSD}}} USD MUST be used as a crucial reference point for your entire analysis. Your reasoning and strategy notes should reflect this live price context.
{{/if}}

Based on this simulated deep analysis, provide:
1.  'coinName': The name of the coin: "{{coinName}}".
2.  'predictedAction': A clear strategic action (e.g., "Strong Buy Opportunity", "Potential Favorable Entry Window", "Monitor for Entry Confirmation", "Potential Sell/Profit-Taking Window", "Consider De-risking/Partial Exit", "Neutral - Hold and Observe").
3.  'timingWindowEstimate': A specific, descriptive estimate of the opportune timing window (e.g., "Next 4-8 hours, aligning with Asian market open", "During US market close if volatility persists", "Over the next 24-48 hours pending news release X"). Avoid overly vague statements.
4.  'keyReasoning': A detailed explanation of why this timing window and action are suggested. What specific simulated indicators, patterns, or expected events make this window strategic? If 'currentPriceUSD' was provided, make sure your reasoning acknowledges it and is consistent with that current price.
5.  'confidence': Your confidence level (High, Medium, Low) in this prediction.
6.  'strategyNotes': Brief, actionable advice for a trader considering this timing (e.g., "Confirm with a break above resistance", "Consider a partial position", "Have a clear stop-loss in mind due to event risk").
7.  'disclaimer': The standard disclaimer.

Your analysis should be insightful, clearly linking the predicted timing to underlying (simulated) market dynamics or expected events.
`,
});

const getStrategicCoinTimingFlow = ai.defineFlow(
  {
    name: 'getStrategicCoinTimingFlow',
    inputSchema: StrategicCoinTimingInputSchema,
    outputSchema: StrategicCoinTimingOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output) {
      output.coinName = input.coinName; // Ensure coinName is correctly passed
      if (!output.disclaimer) {
        output.disclaimer = 'Strategic timing predictions are highly speculative and based on AI-simulated market analysis. Not financial advice. Always conduct your own research and manage risk carefully.';
      }
    }
    return output!;
  }
);

    
