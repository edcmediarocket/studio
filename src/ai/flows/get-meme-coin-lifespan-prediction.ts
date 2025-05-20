
'use server';
/**
 * @fileOverview An AI agent that predicts the potential lifespan of a meme coin's current hype cycle.
 *
 * - getMemeCoinLifespanPrediction - A function that predicts lifespan and provides an exit recommendation.
 * - GetMemeCoinLifespanPredictionInput - The input type.
 * - GetMemeCoinLifespanPredictionOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMemeCoinLifespanPredictionInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to analyze.'),
});
export type GetMemeCoinLifespanPredictionInput = z.infer<typeof GetMemeCoinLifespanPredictionInputSchema>;

const GetMemeCoinLifespanPredictionOutputSchema = z.object({
  lifespanEstimate: z
    .string()
    .describe(
      'AI-estimated remaining lifespan of the current hype cycle or pump (e.g., "Pump may be peaking (next 6-12 hours)", "Early signs of fading (1-3 days)", "Sustained momentum possible (3-7 days)", "Consolidation phase, monitor closely").'
    ),
  exitRecommendation: z
    .string()
    .describe(
      'AI-generated recommendation on when or how to consider exiting or de-risking (e.g., "Consider de-risking profits systematically", "Monitor social volume drop for exit signal", "Hold with caution, aggressive stop-loss recommended", "Look for signs of whale distribution as an exit trigger.").'
    ),
  confidence: z
    .enum(['High', 'Medium', 'Low'])
    .describe("The AI's confidence level in this lifespan prediction and exit recommendation."),
  keyFactors: z
    .array(z.string())
    .max(5)
    .describe(
      'List of 2-4 key simulated factors the AI considered (e.g., "Declining social media engagement velocity", "Simulated whale wallets showing net outflows", "Trading volume showing signs of exhaustion post-peak", "Narrative losing steam to newer trends", "Technical indicators (RSI) suggest overbought conditions").'
    ),
  analysisTimestamp: z.string().describe("Timestamp of when this analysis was performed."),
  disclaimer: z
    .string()
    .default(
      'Meme coin lifespan predictions are highly speculative and based on simulated analysis of typical market behavior and sentiment patterns. Not financial advice. DYOR and manage risk.'
    )
    .describe('Standard disclaimer for speculative predictions.'),
});
export type GetMemeCoinLifespanPredictionOutput = z.infer<typeof GetMemeCoinLifespanPredictionOutputSchema>;

export async function getMemeCoinLifespanPrediction(
  input: GetMemeCoinLifespanPredictionInput
): Promise<GetMemeCoinLifespanPredictionOutput> {
  return getMemeCoinLifespanPredictionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMemeCoinLifespanPredictionPrompt',
  input: {schema: GetMemeCoinLifespanPredictionInputSchema},
  output: {schema: GetMemeCoinLifespanPredictionOutputSchema},
  prompt: `You are an expert AI market analyst specializing in the lifecycle patterns of highly volatile meme coins. For the coin "{{coinName}}", your task is to predict the potential remaining lifespan of its current pump or hype cycle and provide an exit strategy recommendation.

Simulate a comprehensive analysis by considering factors such as:
-   **Historical Meme Coin Lifecycle Patterns**: Typical pump durations, common points of exhaustion, and patterns of decline.
-   **Wallet Movement (Simulated)**: Signs of large holder distribution (whales selling), or conversely, continued accumulation.
-   **Volume Decay (Simulated)**: Whether trading volume is sustaining, increasing, or showing signs of decline after a peak.
-   **Social Sentiment Shift (Simulated)**: Is the online hype growing, plateauing, or decreasing? Are new, competing narratives emerging?
-   **Technical Indicators (Conceptual)**: General concepts like RSI indicating overbought/oversold conditions if it were a typical asset, though meme coins often defy standard technicals.

Based on your simulated analysis of these factors, provide:
1.  'lifespanEstimate': A speculative estimate of how much longer the current positive momentum or hype might last (e.g., "Pump may be peaking (next 6-12 hours)", "Early signs of fading (1-3 days)", "Still has legs for another 2-4 days if catalysts continue"). Be specific but cautious.
2.  'exitRecommendation': Actionable advice on when or how a trader might consider exiting or de-risking their position (e.g., "Consider taking partial profits now, trail stop-loss for the rest", "Watch for a 20% drop in 24h social media volume as a key exit signal", "If price breaks below [simulated support level], it may signal a deeper correction").
3.  'confidence': Your confidence level (High, Medium, Low) in this prediction.
4.  'keyFactors': List 2-4 of the most influential simulated factors that led to your lifespan estimate and recommendation.
5.  'analysisTimestamp': This will be set programmatically by the calling function.
6.  'disclaimer': Ensure the standard disclaimer is present.

Your tone should be analytical and cautionary, reflecting the inherent risks of meme coin trading.
`,
});

const getMemeCoinLifespanPredictionFlow = ai.defineFlow(
  {
    name: 'getMemeCoinLifespanPredictionFlow',
    inputSchema: GetMemeCoinLifespanPredictionInputSchema,
    outputSchema: GetMemeCoinLifespanPredictionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output) {
      const now = new Date();
      output.analysisTimestamp = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`;
      if (!output.disclaimer) {
        output.disclaimer = 'Meme coin lifespan predictions are highly speculative and based on simulated analysis of typical market behavior and sentiment patterns. Not financial advice. DYOR and manage risk.';
      }
    }
    return output!;
  }
);
