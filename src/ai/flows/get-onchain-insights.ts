
'use server';
/**
 * @fileOverview Provides AI-generated textual insights about typical on-chain data for a meme coin.
 *
 * - getOnchainInsights - A function that returns on-chain data insights.
 * - GetOnchainInsightsInput - The input type.
 * - GetOnchainInsightsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetOnchainInsightsInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to get on-chain insights for (e.g., Dogecoin).'),
});
export type GetOnchainInsightsInput = z.infer<typeof GetOnchainInsightsInputSchema>;

const GetOnchainInsightsOutputSchema = z.object({
  holderDistributionAnalysis: z
    .string()
    .describe('A textual analysis of typical holder distribution patterns for such a coin (e.g., concentration of top wallets, retail vs whale percentage). This is a general analysis, not based on real-time data unless specified otherwise in prompt.'),
  transactionPatterns: z
    .string()
    .describe('Description of common transaction volume and velocity patterns, and what they might indicate for a coin like this.'),
  smartContractActivity: z
    .string()
    .describe('Insights into typical smart contract interactions related to the coin, if applicable (e.g., staking, LP provision, NFT mints related to the coin).'),
  tokenFlowObservations: z
    .string()
    .describe('General observations about token flow between exchanges and private wallets, and potential interpretations for a coin of this nature.'),
  dataCaveat: z
    .string()
    .default('These insights are AI-generated estimations of typical on-chain characteristics and NOT based on real-time, specific on-chain data for this exact moment unless explicitly stated. Real on-chain data requires specialized tools.')
    .describe('A caveat explaining the nature of the AI-generated on-chain insights.'),
});
export type GetOnchainInsightsOutput = z.infer<typeof GetOnchainInsightsOutputSchema>;

export async function getOnchainInsights(input: GetOnchainInsightsInput): Promise<GetOnchainInsightsOutput> {
  return getOnchainInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getOnchainInsightsPrompt',
  input: {schema: GetOnchainInsightsInputSchema},
  output: {schema: GetOnchainInsightsOutputSchema},
  prompt: `You are an AI blockchain analyst. For the meme coin "{{coinName}}", provide textual insights into its *typical* or *expected* on-chain data characteristics.
Do not invent specific numbers unless you are describing a well-known general pattern for this type of coin.
Focus on qualitative descriptions.

Provide analysis for:
1.  **Holder Distribution Analysis**: What are common patterns for whale concentration, retail spread for a coin like {{coinName}}?
2.  **Transaction Patterns**: Describe typical transaction volume, velocity, and what periods of high/low activity might suggest.
3.  **Smart Contract Activity**: If {{coinName}} is on a smart contract platform, what kind of contract interactions are commonly associated with it or similar meme coins (e.g., liquidity pools, staking if any, associated NFTs)?
4.  **Token Flow Observations**: What are general expectations for token movements between exchanges and private wallets for {{coinName}}?

Ensure the 'dataCaveat' is included in your response, emphasizing these are general AI interpretations.
Format your output as JSON according to the schema.
`,
});

const getOnchainInsightsFlow = ai.defineFlow(
  {
    name: 'getOnchainInsightsFlow',
    inputSchema: GetOnchainInsightsInputSchema,
    outputSchema: GetOnchainInsightsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (output && !output.dataCaveat) {
      output.dataCaveat = 'These insights are AI-generated estimations of typical on-chain characteristics and NOT based on real-time, specific on-chain data for this exact moment unless explicitly stated. Real on-chain data requires specialized tools.';
    }
    return output!;
  }
);
