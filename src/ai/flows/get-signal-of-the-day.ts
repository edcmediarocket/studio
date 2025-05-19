
'use server';
/**
 * @fileOverview An AI agent that generates a "Signal of the Day".
 *
 * - getSignalOfTheDay - A function that generates a daily trading signal.
 * - GetSignalOfTheDayOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema (empty for now, could be expanded for personalization later)
const GetSignalOfTheDayInputSchema = z.object({});
export type GetSignalOfTheDayInput = z.infer<typeof GetSignalOfTheDayInputSchema>;

const GetSignalOfTheDayOutputSchema = z.object({
  coinName: z.string().describe('The name of the coin for the signal.'),
  symbol: z.string().describe('The ticker symbol for the coin (e.g., BTC, DOGE).'),
  signal: z.enum(["Buy", "Sell", "Hold"]).describe('The trading signal: Buy, Sell, or Hold.'),
  briefRationale: z.string().describe('A concise (1-2 sentence) rationale for the signal, based on simulated market analysis.'),
  confidenceScore: z.number().min(0).max(100).int().describe('AI\'s confidence in this signal (0-100).'),
  generatedAt: z.string().describe('Timestamp of when this signal was generated.'),
  disclaimer: z.string().default("This AI-generated Signal of the Day is for informational purposes only and not financial advice. Market conditions are volatile. DYOR.")
});
export type GetSignalOfTheDayOutput = z.infer<typeof GetSignalOfTheDayOutputSchema>;

export async function getSignalOfTheDay(input?: GetSignalOfTheDayInput): Promise<GetSignalOfTheDayOutput> {
  return getSignalOfTheDayFlow(input || {});
}

const prompt = ai.definePrompt({
  name: 'getSignalOfTheDayPrompt',
  input: {schema: GetSignalOfTheDayInputSchema},
  output: {schema: GetSignalOfTheDayOutputSchema},
  prompt: `You are an AI Crypto Analyst. Your task is to identify the single most compelling "Signal of the Day" for today.
Consider simulated overall market trends, recent significant (conceptual) news, and highly active or noteworthy coins.
Provide the coin name, its symbol, a Buy/Sell/Hold signal, a brief (1-2 sentence) rationale based on your simulated analysis, and your confidence score (0-100).
Ensure 'generatedAt' is set to the current time of generation. Include the 'disclaimer'.
Focus on providing one clear, actionable-sounding signal that would be interesting for a general crypto audience.
`,
});

const getSignalOfTheDayFlow = ai.defineFlow(
  {
    name: 'getSignalOfTheDayFlow',
    inputSchema: GetSignalOfTheDayInputSchema,
    outputSchema: GetSignalOfTheDayOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output) {
      output.generatedAt = new Date().toISOString();
      if (!output.disclaimer) {
        output.disclaimer = "This AI-generated Signal of the Day is for informational purposes only and not financial advice. Market conditions are volatile. DYOR.";
      }
    }
    return output!;
  }
);
