
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
The current market price explicitly provided for {{coinName}} is {{{currentPriceUSD}}} USD. This specific value, {{{currentPriceUSD}}} USD, is the **ONLY** current price you MUST use as a reference for all parts of your response.
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

**CRITICAL INSTRUCTIONS IF 'currentPriceUSD' (which is {{{currentPriceUSD}}} USD if provided, otherwise it's not set) IS PROVIDED:**

1.  **\`coinName\` (Output Field)**: Must match the input coin name: "{{coinName}}".

2.  **\`reasoning\` (Output Field)**:
    *   Your \`reasoning\` text **MUST** begin with a sentence that explicitly states and uses the provided current price of {{{currentPriceUSD}}} USD for {{coinName}}. For example: "Based on {{coinName}}'s current price of {{{currentPriceUSD}}} USD, our analysis considers..." or "Starting from {{{currentPriceUSD}}} USD for {{coinName}}, the future outlook is...".
    *   All subsequent analysis and discussion in this \`reasoning\` field must be consistent with this {{{currentPriceUSD}}} USD starting point. **Under NO circumstances should you invent or refer to any other value as the 'current price' in your reasoning.**
    *   After acknowledging the current price, explain the factors considered for your predictions (e.g., simulated market trends, potential catalysts, coin-specific sentiment). Always emphasize the speculative nature of meme coin predictions.

3.  **\`predictions\` (Output Field - Array of {timeframe, predictedPrice})**:
    *   Each \`predictedPrice\` in the array **MUST** be a mathematically plausible future value derived *directly* from the provided 'currentPriceUSD' (which is {{{currentPriceUSD}}} USD). These predictions should represent speculative percentage changes or absolute changes from {{{currentPriceUSD}}} USD.
    *   For example, if {{{currentPriceUSD}}} is $2.50, a 1-week prediction might be "$2.75" (a 10% increase) or "$2.30" (a -8% change). Your predicted prices MUST be in a similar dollar range to {{{currentPriceUSD}}}. **Do NOT generate prices like $0.000x or $5000 if the current price is $2.50, unless you are predicting an extreme, well-justified, and explicitly stated event (e.g., "a potential 100x due to major breakthrough" or "a collapse to near zero due to critical vulnerability").**
    *   Provide \`predictedPrice\` as a string (e.g., "$0.1234", "May test $0.50"). Ensure the currency symbol is appropriate.

**IF 'currentPriceUSD' IS NOT PROVIDED:**
1.  Your \`reasoning\` should clearly state that predictions are general estimations because no specific current price was provided.
2.  Your \`predictedPrice\` values will be general estimations (e.g., "$0.000x could become $0.00y", "potential for 2x to 3x from current general levels").

**ALL RESPONSES:**
-   **\`confidenceLevel\` (Output Field)**: State your overall confidence ('High', 'Medium', 'Low') in these collective predictions.
-   **\`disclaimer\` (Output Field)**: Ensure the standard disclaimer is included.

Make the predictions sound plausible for a meme coin but clearly speculative.
**REITERATION: All references to the current price, both in your textual \`reasoning\` and in calculating numerical \`predictedPrice\` values, MUST use the provided value of {{{currentPriceUSD}}} USD if it was given. No other 'current price' should be assumed or mentioned in that case.**
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

