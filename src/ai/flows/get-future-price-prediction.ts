
'use server';
/**
 * @fileOverview Provides AI-generated speculative future price predictions for a meme coin, considering its current price.
 *
 * - getFuturePricePrediction - A function that returns future price predictions.
 * - GetFuturePricePredictionInput - The input type.
 * - GetFuturePricePredictionOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

const GetFuturePricePredictionInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin).'),
  currentPriceUSD: z.number().optional().describe('The current market price of the coin in USD, to be used as a reference for prediction generation.'),
});
export type GetFuturePricePredictionInput = z.infer<typeof GetFuturePricePredictionInputSchema>;

const PredictionTimeframeSchema = z.object({
  timeframe: z.string().describe('The prediction horizon (e.g., "1 Week", "1 Month").'),
  predictedPrice: z.string().describe('The AI-estimated price for this timeframe (e.g., "$0.1234", "Could reach $1.00"). This price MUST be a plausible future value relative to the currentPriceUSD if provided.'),
});

const GetFuturePricePredictionOutputSchema = z.object({
  coinName: z.string().describe('The name of the coin for which predictions are made.'),
  predictions: z
    .array(PredictionTimeframeSchema)
    .describe('An array of price predictions for different future timeframes.'),
  confidenceLevel: z
    .enum(['High', 'Medium', 'Low'])
    .describe("The AI's confidence level in these predictions."),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of the factors considered for these predictions (e.g., market trends, potential catalysts, coin-specific news). Always highlight the speculative nature. This reasoning MUST explicitly state and use the provided currentPriceUSD if available.'
    ),
  disclaimer: z
    .string()
    .default('Future price predictions are highly speculative and not financial advice. Market conditions for meme coins can change extremely rapidly. Always conduct your own research (DYOR).')
    .describe('Standard disclaimer for speculative predictions.'),
});
export type GetFuturePricePredictionOutput = z.infer<typeof GetFuturePricePredictionOutputSchema>;

export async function getFuturePricePrediction(input: GetFuturePricePredictionInput): Promise<GetFuturePricePredictionOutput> {
  return getFuturePricePredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getFuturePricePredictionPrompt',
  input: {schema: GetFuturePricePredictionInputSchema},
  output: {schema: GetFuturePricePredictionOutputSchema},
  prompt: `You are an AI market analyst specializing in speculative forecasting for meme coins.
For the coin "{{coinName}}"{{#if currentPriceUSD}}, which is currently trading around {{{currentPriceUSD}}} USD{{/if}}, provide future price predictions.

Generate predictions for the following timeframes:
- 1 Week
- 1 Month
- 6 Months
- 1 Year (if plausible to speculate this far for a meme coin)

For each timeframe, provide a 'predictedPrice' as a string (e.g., "$0.1234", "May test $0.50").

**CRITICAL INSTRUCTIONS IF currentPriceUSD ({{{currentPriceUSD}}} USD) IS PROVIDED:**

1.  **Reasoning Text**: Your 'reasoning' field **MUST** explicitly state the current price used for your analysis. For example, if {{{currentPriceUSD}}} USD is the input, your reasoning should include a phrase like "Given the current price of {{{currentPriceUSD}}} USD, our analysis considers..." or "Starting from the current price of {{{currentPriceUSD}}} USD...". **DO NOT use any other value for the current price in your reasoning text if {{{currentPriceUSD}}} is available.**

2.  **Numerical Predictions**: Your 'predictedPrice' values for each timeframe **MUST** be mathematically plausible future values derived from the input 'currentPriceUSD' ({{{currentPriceUSD}}} USD).
    *   They should represent speculative percentage changes (e.g., +/- 5-50% for shorter terms, potentially wider for longer terms) directly from this 'currentPriceUSD'.
    *   For example, if 'currentPriceUSD' is {{{currentPriceUSD}}} USD, a short-term prediction should be a value like {{{currentPriceUSD}}} * 1.10 or {{{currentPriceUSD}}} * 0.90, NOT an arbitrary low number unless that represents a realistic crash from {{{currentPriceUSD}}} USD.
    *   If 'currentPriceUSD' is {{{currentPriceUSD}}} USD, do **NOT** predict $0.0001 unless a crash to that level from {{{currentPriceUSD}}} is the specific prediction you are making and justifying.
    *   The scale of your predictions **MUST** directly reflect the scale of 'currentPriceUSD' ({{{currentPriceUSD}}} USD).

If 'currentPriceUSD' is NOT provided, you may make more general estimations, but clearly state that they are not based on a specific current price.

Include an overall 'confidenceLevel' ('High', 'Medium', 'Low') for these collective predictions.
Provide 'reasoning' as described above, explaining the general basis for your predictions considering factors like simulated market trends, potential catalysts, and coin-specific sentiment.
Ensure the 'disclaimer' is included.
The 'coinName' in the output should match the input.

Format your response strictly according to the JSON output schema.
Example for a prediction (if current price was $0.000020 USD): { timeframe: "1 Month", predictedPrice: "$0.000025" }
Example for a prediction (if current price was $2.00 USD): { timeframe: "1 Week", predictedPrice: "$2.15" }

Make the predictions sound plausible for a meme coin but clearly speculative, and **ALWAYS DIRECTLY AND LOGICALLY RELATED** to the current price ({{{currentPriceUSD}}} USD) if one is given, both in text and in predicted values.
`,
});

const getFuturePricePredictionFlow = ai.defineFlow(
  {
    name: 'getFuturePricePredictionFlow',
    inputSchema: GetFuturePricePredictionInputSchema,
    outputSchema: GetFuturePricePredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output) {
      output.coinName = input.coinName; // Ensure coinName is in the output
      if (!output.disclaimer) {
        output.disclaimer = 'Future price predictions are highly speculative and not financial advice. Market conditions for meme coins can change extremely rapidly. Always conduct your own research (DYOR).';
      }
    }
    return output!;
  }
);

