
'use server';
/**
 * @fileOverview An AI agent that provides a trading signal based on hypothetical "what-if" scenarios.
 *
 * - getWhatIfScenarioSignal - A function that provides the scenario-based trading signal and analysis.
 * - GetWhatIfScenarioSignalInput - The input type.
 * - GetWhatIfScenarioSignalOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z}from 'genkit';

export const GetWhatIfScenarioSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin).'),
  currentPriceUSD: z.number().optional().describe('The current actual market price of the coin in USD, for context.'),
  hypotheticalPriceUSD: z.number().describe('The hypothetical future price of the coin in USD for this scenario.'),
  hypotheticalVolumeCondition: z.string().describe('A description of the hypothetical volume condition (e.g., "volume triples", "volume decreases by 50%", "volume remains low").'),
  // Optional: Add user's timeframe/risk if the AI Coach page starts collecting these
  // timeframe: z.enum(['1H', '4H', '1D', '1W']).optional().describe('User desired trading timeframe.'),
  // riskProfile: z.enum(['Low', 'Medium', 'High']).optional().describe("User's risk profile."),
});
export type GetWhatIfScenarioSignalInput = z.infer<typeof GetWhatIfScenarioSignalInputSchema>;

export const GetWhatIfScenarioSignalOutputSchema = z.object({
  scenarioDescription: z.string().describe('A clear description of the "what-if" scenario being analyzed.'),
  recommendation: z.enum(['Buy', 'Sell', 'Hold', 'Strong Buy', 'Strong Sell', 'Aggressive Buy', 'Cautious Hold']).describe('The trading recommendation based on the hypothetical scenario.'),
  confidenceScore: z.number().min(0).max(100).int().describe('AI\'s confidence in this scenario-based recommendation (0-100).'),
  analysisAndStrategy: z.string().describe('Detailed analysis of why this recommendation is made under the hypothetical conditions, and a suggested strategy. Explain how the hypothetical price and volume influence the decision.'),
  keyConsiderations: z.array(z.string()).optional().describe('Specific factors or indicators that would be critical to watch in this hypothetical scenario.'),
  disclaimer: z.string().default("This What-If scenario analysis is AI-generated, highly speculative, and for informational purposes only. It does not constitute financial advice. Market conditions can change rapidly and unpredictably.").describe("Standard disclaimer.")
});
export type GetWhatIfScenarioSignalOutput = z.infer<typeof GetWhatIfScenarioSignalOutputSchema>;

export async function getWhatIfScenarioSignal(input: GetWhatIfScenarioSignalInput): Promise<GetWhatIfScenarioSignalOutput> {
  return getWhatIfScenarioSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getWhatIfScenarioSignalPrompt',
  input: {schema: GetWhatIfScenarioSignalInputSchema},
  output: {schema: GetWhatIfScenarioSignalOutputSchema},
  prompt: `You are an expert AI Trading Coach specializing in meme coins.
A user wants to explore a "what-if" scenario for the coin: "{{coinName}}".
{{#if currentPriceUSD}}
The coin's current actual price is approximately {{{currentPriceUSD}}} USD. Use this for context if relevant, but focus the primary analysis on the hypothetical.
{{/if}}

The HYPOTHETICAL SCENARIO is:
- Price of {{coinName}} becomes: {{{hypotheticalPriceUSD}}} USD
- Trading Volume condition: "{{{hypotheticalVolumeCondition}}}"

Based *solely* on this hypothetical scenario:
1.  Provide a 'scenarioDescription' that clearly restates the hypothetical conditions.
2.  What is your 'recommendation' (e.g., Buy, Sell, Hold, Strong Buy, Cautious Hold)?
3.  What is your 'confidenceScore' (0-100) in this recommendation for this specific scenario?
4.  Provide a detailed 'analysisAndStrategy': Explain your reasoning. How do the hypothetical price and volume influence your decision? What strategy would you suggest under these specific hypothetical conditions?
5.  List any 'keyConsiderations' (optional): What specific indicators or factors would be most important to monitor if this scenario were to materialize?

Assume a general medium-term trading outlook and a balanced risk appetite unless specified otherwise.
Strictly adhere to the output schema. Ensure the 'disclaimer' is included.
Focus your entire analysis on the implications of the provided hypothetical price and volume.
`,
});

const getWhatIfScenarioSignalFlow = ai.defineFlow(
  {
    name: 'getWhatIfScenarioSignalFlow',
    inputSchema: GetWhatIfScenarioSignalInputSchema,
    outputSchema: GetWhatIfScenarioSignalOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This What-If scenario analysis is AI-generated, highly speculative, and for informational purposes only. It does not constitute financial advice. Market conditions can change rapidly and unpredictably.";
    }
    return output!;
  }
);
