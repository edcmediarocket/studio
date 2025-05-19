
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
  currentPriceUSD: z.number().optional().describe('The current market price of the coin in USD. If provided, this exact value MUST be used by the AI as the starting point for all reasoning and numerical predictions.'),
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
      'A detailed explanation of the factors considered. If currentPriceUSD was provided in the input, THIS REASONING MUST START by acknowledging it, e.g., "Based on the current price of $X.XX USD for {{coinName}}, our analysis..." or "Given {{coinName}}\'s current price of $Y.YY USD...". The rest of the reasoning must be consistent with this starting price. DO NOT invent or use a different current price. Always highlight the speculative nature.'
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

The user is asking for future price predictions for the coin: "{{coinName}}".
{{#if currentPriceUSD}}
The current market price provided for {{coinName}} is {{{currentPriceUSD}}} USD. This is the **ONLY** current price you MUST use as a reference for all parts of your response.
{{else}}
No specific current market price was provided for {{coinName}}. Your predictions will be general estimations.
{{/if}}

Your primary task is to generate future price predictions.
Generate predictions for the following timeframes:
- 1 Week
- 1 Month
- 6 Months
- 1 Year (if plausible to speculate this far for a meme coin)

Your response MUST strictly follow the JSON output schema.

**CRITICAL INSTRUCTIONS FOR YOUR RESPONSE:**

1.  **\`coinName\` (Output Field)**: Must match the input coin name: "{{coinName}}".

2.  **\`reasoning\` (Output Field)**:
    *   {{#if currentPriceUSD}}
        Your \`reasoning\` text **MUST** begin with a sentence that explicitly states and uses the provided current price of {{{currentPriceUSD}}} USD for {{coinName}}. For example: "Based on {{coinName}}'s current price of {{{currentPriceUSD}}} USD, our analysis considers..." or "Starting from {{{currentPriceUSD}}} USD for {{coinName}}, the future outlook is...".
        All subsequent analysis and discussion in this \`reasoning\` field must be consistent with this {{{currentPriceUSD}}} USD starting point. **Under no circumstances should you invent or refer to any other value as the 'current price' in your reasoning if {{{currentPriceUSD}}} was provided.**
    *   {{else}}
        Your \`reasoning\` should clearly state that predictions are general estimations because no specific current price was provided.
    *   {{/if}}
    *   After acknowledging the current price (if provided), explain the factors considered for your predictions (e.g., simulated market trends, potential catalysts, coin-specific sentiment). Always emphasize the speculative nature of meme coin predictions.

3.  **\`predictions\` (Output Field - Array of {timeframe, predictedPrice})**:
    *   {{#if currentPriceUSD}}
        Each \`predictedPrice\` in the array **MUST** be a mathematically plausible future value derived *directly* from the provided 'currentPriceUSD' (which is {{{currentPriceUSD}}} USD).
        These predictions should represent speculative percentage changes (e.g., a 10% increase from {{{currentPriceUSD}}} would be {{{currentPriceUSD}}} * 1.1; a 5% decrease would be {{{currentPriceUSD}}} * 0.95).
        The scale of your numerical predictions **MUST** directly reflect the scale of the provided {{{currentPriceUSD}}} USD. For instance, if {{{currentPriceUSD}}} is $2.50, your predictions should be in a similar dollar range (e.g., $2.75, $2.20), not $0.000x or $5000 unless you are predicting an extreme, well-justified event.
    *   {{else}}
        \`predictedPrice\` values will be general estimations (e.g., "$0.000x could become $0.00y", "potential for 2x to 3x from current general levels").
    *   {{/if}}
    *   Provide \`predictedPrice\` as a string (e.g., "$0.1234", "May test $0.50"). Ensure the currency symbol is appropriate.

4.  **\`confidenceLevel\` (Output Field)**: State your overall confidence ('High', 'Medium', 'Low') in these collective predictions.
5.  **\`disclaimer\` (Output Field)**: Ensure the standard disclaimer is included.

Make the predictions sound plausible for a meme coin but clearly speculative.
{{#if currentPriceUSD}}
**REITERATION: All references to the current price, both in your textual \`reasoning\` and in calculating numerical \`predictedPrice\` values, MUST use the provided value of {{{currentPriceUSD}}} USD. No other 'current price' should be assumed or mentioned.**
{{/if}}
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

