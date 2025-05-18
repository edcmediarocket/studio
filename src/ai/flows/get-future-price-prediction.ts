
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
  predictedPrice: z.string().describe('The AI-estimated price for this timeframe (e.g., "$0.1234", "Could reach $1.00").'),
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
      'A brief explanation of the factors considered for these predictions (e.g., market trends, potential catalysts, coin-specific news). Always highlight the speculative nature.'
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
Also include an overall 'confidenceLevel' ('High', 'Medium', 'Low') for these collective predictions.
Provide 'reasoning' that explains the general basis for your predictions, mentioning factors like simulated market trends, potential catalysts (e.g., hype cycles, roadmap milestones if known for meme coins), and coin-specific sentiment. Critically, this reasoning must emphasize the highly speculative nature of meme coin price movements. If a current price was provided, factor that into your reasoning and targets.
Ensure the 'disclaimer' is included.
The 'coinName' in the output should match the input.

Format your response strictly according to the JSON output schema.
Example for a prediction: { timeframe: "1 Month", predictedPrice: "$0.000025" }
Make the predictions sound plausible for a meme coin but clearly speculative.
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

