// This file is machine generated - edit at your own risk.

'use server';

/**
 * @fileOverview Predicts the potential ROI of a meme coin using AI estimates.
 *
 * - predictMemeCoinRoi - A function that predicts the ROI of a meme coin.
 * - PredictMemeCoinRoiInput - The input type for the predictMemeCoinRoi function.
 * - PredictMemeCoinRoiOutput - The return type for the predictMemeCoinRoi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictMemeCoinRoiInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin.'),
  investmentAmount: z.number().describe('The amount of investment in USD.'),
  predictionHorizon: z
    .string()
    .describe(
      'The prediction horizon (e.g., 1 week, 1 month, 6 months, 1 year).'
    ),
});
export type PredictMemeCoinRoiInput = z.infer<
  typeof PredictMemeCoinRoiInputSchema
>;

const PredictMemeCoinRoiOutputSchema = z.object({
  predictedRoi: z
    .number()
    .describe(
      'The predicted ROI as a percentage (e.g., 0.1 for 10% ROI, 0.5 for 50% ROI).'
    ),
  predictedValue: z
    .number()
    .describe('The predicted value of the investment after the prediction horizon.'),
  confidenceLevel: z
    .string()
    .describe('The confidence level of the prediction (e.g., high, medium, low).'),
  reasoning: z
    .string()
    .describe('The AI reasoning behind the ROI prediction.'),
});
export type PredictMemeCoinRoiOutput = z.infer<
  typeof PredictMemeCoinRoiOutputSchema
>;

export async function predictMemeCoinRoi(
  input: PredictMemeCoinRoiInput
): Promise<PredictMemeCoinRoiOutput> {
  return predictMemeCoinRoiFlow(input);
}

const predictMemeCoinRoiPrompt = ai.definePrompt({
  name: 'predictMemeCoinRoiPrompt',
  input: {schema: PredictMemeCoinRoiInputSchema},
  output: {schema: PredictMemeCoinRoiOutputSchema},
  prompt: `You are an AI assistant that provides ROI predictions for meme coins.

You will be provided with the coin name, the investment amount, and the prediction horizon.  You will respond with the predicted ROI as a percentage, the predicted value of the investment, the confidence level of the prediction, and the reasoning behind the prediction.

Coin Name: {{{coinName}}}
Investment Amount (USD): {{{investmentAmount}}}
Prediction Horizon: {{{predictionHorizon}}}

Respond in a structured JSON format.
`,
});

const predictMemeCoinRoiFlow = ai.defineFlow(
  {
    name: 'predictMemeCoinRoiFlow',
    inputSchema: PredictMemeCoinRoiInputSchema,
    outputSchema: PredictMemeCoinRoiOutputSchema,
  },
  async input => {
    const {output} = await predictMemeCoinRoiPrompt(input);
    return output!;
  }
);
