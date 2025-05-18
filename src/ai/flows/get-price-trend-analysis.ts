
'use server';
/**
 * @fileOverview Provides AI-generated textual analysis of potential price trends for a meme coin.
 *
 * - getPriceTrendAnalysis - A function that returns price trend analysis.
 * - GetPriceTrendAnalysisInput - The input type.
 * - GetPriceTrendAnalysisOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPriceTrendAnalysisInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin).'),
});
export type GetPriceTrendAnalysisInput = z.infer<typeof GetPriceTrendAnalysisInputSchema>;

const GetPriceTrendAnalysisOutputSchema = z.object({
  currentTrendOutlook: z.string().describe('A textual description of the current perceived price trend (e.g., "bullish short-term momentum", "consolidating", "bearish pressure").'),
  keyDrivingFactors: z.array(z.string()).describe('List of key factors currently influencing or likely to influence the price trend (e.g., "Social media hype", "Overall market sentiment", "Upcoming project milestones", "Lack of utility").'),
  potentialScenarios: z.string().describe('Brief description of potential optimistic and pessimistic scenarios for the price in the near future.'),
  supportResistanceLevels: z.string().optional().describe('AI-estimated key support and resistance levels based on general TA principles, if applicable and can be inferred without real chart data. State if highly speculative.'),
  confidence: z.string().describe('AI\'s confidence in this trend analysis (High, Medium, Low) with a brief justification.'),
  disclaimer: z.string().default("This AI-generated price trend analysis is speculative and not financial advice. Market conditions can change rapidly.").describe("Standard disclaimer."),
});
export type GetPriceTrendAnalysisOutput = z.infer<typeof GetPriceTrendAnalysisOutputSchema>;

export async function getPriceTrendAnalysis(input: GetPriceTrendAnalysisInput): Promise<GetPriceTrendAnalysisOutput> {
  return getPriceTrendAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPriceTrendAnalysisPrompt',
  input: {schema: GetPriceTrendAnalysisInputSchema},
  output: {schema: GetPriceTrendAnalysisOutputSchema},
  prompt: `You are an AI market analyst specializing in meme coin price trends. For "{{coinName}}", provide a textual analysis of its potential price trends.
This analysis should be based on general knowledge, common patterns for meme coins, and publicly perceived sentiment or news if widely known. Do NOT use real-time chart data unless explicitly told it's available.

Your analysis should include:
- **Current Trend Outlook**: Is it generally bullish, bearish, or consolidating?
- **Key DrivingFactors**: What are 2-3 primary factors influencing its price now or in the near future?
- **Potential Scenarios**: Briefly describe an optimistic and a pessimistic outcome.
- **Support/Resistance Levels (Optional & Speculative)**: If you can describe general TA-based support/resistance ideas for such a coin without specific chart data, do so, clearly marking it as speculative. Otherwise, omit or state N/A.
- **Confidence**: Your confidence level in this analysis.
- **Disclaimer**: Ensure the standard disclaimer is present.

Format output as JSON.
Example for support/resistance: "Based on general patterns for volatile assets, speculative support might be around [estimated lower bound] if a recent peak was [estimated peak], with resistance near [estimated peak]. This is highly speculative without chart data."
`,
});

const getPriceTrendAnalysisFlow = ai.defineFlow(
  {
    name: 'getPriceTrendAnalysisFlow',
    inputSchema: GetPriceTrendAnalysisInputSchema,
    outputSchema: GetPriceTrendAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This AI-generated price trend analysis is speculative and not financial advice. Market conditions can change rapidly.";
    }
    return output!;
  }
);
