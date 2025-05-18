
'use server';
/**
 * @fileOverview Provides AI-generated textual analysis of potential whale movements for a meme coin.
 *
 * - getWhaleMovementAnalysis - A function that returns whale movement analysis.
 * - GetWhaleMovementAnalysisInput - The input type.
 * - GetWhaleMovementAnalysisOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetWhaleMovementAnalysisInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin).'),
});
export type GetWhaleMovementAnalysisInput = z.infer<typeof GetWhaleMovementAnalysisInputSchema>;

const GetWhaleMovementAnalysisOutputSchema = z.object({
  activitySummary: z.string().describe('A summary of typical or expected whale activity patterns concerning this meme coin (e.g., accumulation during dips, profit-taking during pumps, large transfers between wallets).'),
  potentialImpact: z.string().describe('Analysis of how such whale movements could potentially impact the coin\'s price and market sentiment.'),
  detectionIndicators: z.array(z.string()).describe('General indicators that might suggest whale activity, even without direct transaction data (e.g., "Sudden large spikes in volume", "Unusual social media silence or hype from known large holders", "Significant price movements without broad market correlation").'),
  dataCaveat: z.string().default('This analysis describes general patterns of whale activity and is not based on real-time tracking of specific whale wallets. Actual whale movements require specialized on-chain analysis tools.').describe('Standard disclaimer about the nature of the analysis.'),
});
export type GetWhaleMovementAnalysisOutput = z.infer<typeof GetWhaleMovementAnalysisOutputSchema>;

export async function getWhaleMovementAnalysis(input: GetWhaleMovementAnalysisInput): Promise<GetWhaleMovementAnalysisOutput> {
  return getWhaleMovementAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWhaleMovementAnalysisPrompt',
  input: {schema: GetWhaleMovementAnalysisInputSchema},
  output: {schema: GetWhaleMovementAnalysisOutputSchema},
  prompt: `You are an AI crypto market analyst focusing on whale behavior for meme coins. For "{{coinName}}", provide a textual analysis of potential or typical whale movements and their implications.
This is a general analysis, not based on real-time wallet tracking.

Your analysis should cover:
- **Activity Summary**: Describe common whale behaviors associated with coins like {{coinName}} (e.g., accumulation, distribution, large transfers).
- **Potential Impact**: How do these activities typically affect price and sentiment?
- **Detection Indicators**: What are some general signs (not requiring direct on-chain data access) that might hint at whale activity for {{coinName}}?

Ensure the 'dataCaveat' is included. Format output as JSON.
`,
});

const getWhaleMovementAnalysisFlow = ai.defineFlow(
  {
    name: 'getWhaleMovementAnalysisFlow',
    inputSchema: GetWhaleMovementAnalysisInputSchema,
    outputSchema: GetWhaleMovementAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && !output.dataCaveat) {
      output.dataCaveat = 'This analysis describes general patterns of whale activity and is not based on real-time tracking of specific whale wallets. Actual whale movements require specialized on-chain analysis tools.';
    }
    return output!;
  }
);
