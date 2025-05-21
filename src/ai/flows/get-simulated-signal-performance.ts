
'use server';
/**
 * @fileOverview An AI agent that generates a simulated historical performance analysis for its trading signals on a given coin.
 *
 * - getSimulatedSignalPerformance - A function that returns the simulated performance.
 * - GetSimulatedSignalPerformanceInput - The input type for the function.
 * - GetSimulatedSignalPerformanceOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetSimulatedSignalPerformanceInputSchema = z.object({
  coinName: z.string().describe('The name of the cryptocurrency to analyze (e.g., Dogecoin, Bitcoin).'),
});
export type GetSimulatedSignalPerformanceInput = z.infer<typeof GetSimulatedSignalPerformanceInputSchema>;

const GetSimulatedSignalPerformanceOutputSchema = z.object({
  coinName: z.string().describe("The name of the coin for which performance is simulated."),
  simulatedAccuracyRate: z.number().min(0).max(100).describe('Simulated historical accuracy rate of AI signals for this coin (e.g., 65 for 65%). This is a conceptual estimation.'),
  simulatedProfitFactor: z.number().positive().describe('Simulated profit factor (e.g., 1.5 means $1.50 conceptual profit for every $1 conceptual loss from past signals). This is a conceptual estimation and must be a positive number.'),
  keyStrengths: z.array(z.string()).max(3).describe('List of 2-3 simulated key strengths of the AI signal strategy for this coin (e.g., "Good at identifying short-term breakouts", "Effective during high volatility periods").'),
  keyWeaknesses: z.array(z.string()).max(3).describe('List of 2-3 simulated key weaknesses or limitations of the AI signal strategy for this coin (e.g., "Less accurate during low-volume consolidation", "Prone to false signals on purely news-driven pumps").'),
  lastSimulatedBacktestDate: z.string().describe('Simulated date of the last conceptual backtest (e.g., "As of May 15, 2025"). This will be set programmatically by the system.'),
  summary: z.string().describe('Overall textual summary of the simulated historical performance, integrating the above metrics and providing context. This is a conceptual estimation.'),
  disclaimer: z.string().default("This is a simulated historical performance analysis based on AI interpretations and NOT on actual trading results or rigorous backtesting. Past simulated performance is not indicative of future results. DYOR and consult a financial advisor.").describe('Standard disclaimer for simulated performance.'),
});
export type GetSimulatedSignalPerformanceOutput = z.infer<typeof GetSimulatedSignalPerformanceOutputSchema>;

export async function getSimulatedSignalPerformance(input: GetSimulatedSignalPerformanceInput): Promise<GetSimulatedSignalPerformanceOutput> {
  const result = await getSimulatedSignalPerformanceFlow(input);
  // Ensure coinName and a valid date are always in the output
  result.coinName = input.coinName; 
  // Always set the lastSimulatedBacktestDate programmatically
  result.lastSimulatedBacktestDate = `As of ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
  
  return result;
}

const prompt = ai.definePrompt({
  name: 'getSimulatedSignalPerformancePrompt',
  input: {schema: GetSimulatedSignalPerformanceInputSchema},
  output: {schema: GetSimulatedSignalPerformanceOutputSchema},
  prompt: `You are an AI Crypto Analyst. For the coin "{{coinName}}", generate a *plausible, simulated* historical performance analysis of your AI-driven trading signals.
This is a conceptual exercise. Act as if you have access to a history of signals you've generated for this coin and the coin's past price action.
Your output MUST adhere to the JSON schema. Provide:
- 'simulatedAccuracyRate': An estimated percentage (0-100) of how often your signals for this coin might have been "correct" in the past. Make this sound plausible (e.g., between 40-75%).
- 'simulatedProfitFactor': A plausible positive profit factor (e.g., between 1.1 and 3.0). This is total conceptual gains divided by total conceptual losses.
- 'keyStrengths': 2-3 concise bullet points on what your signal strategy for {{coinName}} seems to do well (e.g., "Capturing momentum swings", "Identifying oversold conditions", "Strong performance in trending markets").
- 'keyWeaknesses': 2-3 concise bullet points on limitations or areas where signals might be less reliable for {{coinName}} (e.g., "Susceptible to sudden FUD events", "Less effective in choppy, sideways markets", "Difficulty with extremely low liquidity coins").
- 'summary': A 2-3 sentence textual summary synthesizing these points, providing context on how the AI's signals *might have conceptually performed* for {{coinName}}.
- 'lastSimulatedBacktestDate': You do not need to generate this field; it will be set programmatically.
- 'disclaimer': Ensure the standard disclaimer is included.

Focus on generating plausible and insightful-sounding metrics and descriptions for {{coinName}}. The goal is to give a *sense* of potential past performance, not an actual backtest. Ensure all fields except lastSimulatedBacktestDate are populated.
`,
});

const getSimulatedSignalPerformanceFlow = ai.defineFlow(
  {
    name: 'getSimulatedSignalPerformanceFlow',
    inputSchema: GetSimulatedSignalPerformanceInputSchema,
    outputSchema: GetSimulatedSignalPerformanceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output) {
      if (!output.disclaimer) {
        output.disclaimer = "This is a simulated historical performance analysis based on AI interpretations and NOT on actual trading results or rigorous backtesting. Past simulated performance is not indicative of future results. DYOR and consult a financial advisor.";
      }
      // coinName and lastSimulatedBacktestDate will be handled by the wrapper function
    }
    return output!;
  }
);

