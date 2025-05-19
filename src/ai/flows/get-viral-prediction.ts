
'use server';
/**
 * @fileOverview An AI agent that predicts the potential for a meme coin to go viral.
 *
 * - getViralPrediction - A function that predicts virality.
 * - GetViralPredictionInput - The input type for the function.
 * - GetViralPredictionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetViralPredictionInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to predict virality for (e.g., Dogecoin).'),
});
export type GetViralPredictionInput = z.infer<typeof GetViralPredictionInputSchema>;

const GetViralPredictionOutputSchema = z.object({
  timeToTrendEstimate: z
    .string()
    .describe(
      'Estimated time until the coin might go viral or trend significantly (e.g., "< 12 hours", "1-2 days", "Already Trending", "Unlikely Soon", "Monitoring for Catalysts").'
    ),
  confidence: z
    .enum(['High', 'Medium', 'Low'])
    .describe("The AI's confidence in this virality prediction."),
  keyFactors: z
    .array(z.string())
    .describe(
      "Key simulated factors leading to this prediction (e.g., 'Sudden surge in Twitter mentions', 'Influencer X just posted about it', 'Volume increase on DEX Y', 'Breakout above key resistance with volume confirmation')."
    ),
  reasoning: z
    .string()
    .describe(
      'A brief explanation of the prediction, synthesizing the key factors and current market/social context for the coin.'
    ),
  disclaimer: z
    .string()
    .default(
      'Virality predictions are speculative and based on simulated AI analysis of social and market activity. Not financial advice. DYOR.'
    )
    .describe('Standard disclaimer.'),
});
export type GetViralPredictionOutput = z.infer<typeof GetViralPredictionOutputSchema>;

export async function getViralPrediction(
  input: GetViralPredictionInput
): Promise<GetViralPredictionOutput> {
  return getViralPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getViralPredictionPrompt',
  input: {schema: GetViralPredictionInputSchema},
  output: {schema: GetViralPredictionOutputSchema},
  prompt: `You are an AI market analyst specializing in predicting the virality and trending potential of meme coins.
For the coin "{{coinName}}", simulate an analysis of its current social media momentum, influencer activity, trading volume patterns, and any recent news or catalysts.

Based on your simulated analysis, provide:
1.  'timeToTrendEstimate': A plausible estimation of when this coin might "go viral" or experience a significant surge in attention and trading activity. Use realistic but speculative timeframes like "< 6 hours", "< 24 hours", "2-3 days", "Next week if X catalyst occurs", "Already Trending", "Monitoring for Catalysts", or "Unlikely Soon".
2.  'confidence': Your confidence level (High, Medium, Low) in this "time to trend" prediction.
3.  'keyFactors': List 3-5 specific, simulated key factors that are driving your prediction (e.g., "Rapidly increasing mentions on Twitter/X", "A major influencer with Y followers just mentioned {{coinName}} positively", "Unusual spike in trading volume on Uniswap in the last hour", "Recent listing on a mid-tier exchange creating buzz", "Breakout above key technical resistance level on high volume").
4.  'reasoning': A concise (2-3 sentences) explanation that synthesizes these factors and justifies your 'timeToTrendEstimate' and 'confidence'.
5.  'disclaimer': The standard disclaimer.

Your analysis should be insightful and reflect an understanding of how meme coins gain traction.
Focus on providing a actionable-sounding, yet speculative, outlook.
`,
});

const getViralPredictionFlow = ai.defineFlow(
  {
    name: 'getViralPredictionFlow',
    inputSchema: GetViralPredictionInputSchema,
    outputSchema: GetViralPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer =
        'Virality predictions are speculative and based on simulated AI analysis of social and market activity. Not financial advice. DYOR.';
    }
    return output!;
  }
);
