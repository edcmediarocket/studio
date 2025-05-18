
'use server';
/**
 * @fileOverview An AI agent that compares two meme coins.
 *
 * - compareMemeCoins - A function that compares two meme coins.
 * - CompareMemeCoinsInput - The input type for the compareMemeCoins function.
 * - CompareMemeCoinsOutput - The return type for the compareMemeCoins function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CompareMemeCoinsInputSchema = z.object({
  coin1Name: z.string().describe('The name of the first meme coin for comparison (e.g., Dogecoin).'),
  coin2Name: z.string().describe('The name of the second meme coin for comparison (e.g., Shiba Inu).'),
});
export type CompareMemeCoinsInput = z.infer<typeof CompareMemeCoinsInputSchema>;

const ComparisonMetricSchema = z.object({
  metric: z.string().describe('The aspect being compared (e.g., "Current Price", "Market Cap", "Technology Stack", "Community Sentiment", "Potential Upside", "Key Risks").'),
  coin1Value: z.string().describe('The value or assessment for the first coin.'),
  coin2Value: z.string().describe('The value or assessment for the second coin.'),
  notes: z.string().optional().describe('Brief comparative note or observation.'),
});

const CompareMemeCoinsOutputSchema = z.object({
  comparisonTable: z
    .array(ComparisonMetricSchema)
    .describe('A table-like structure comparing the two coins across various metrics.'),
  overallSummary: z
    .string()
    .describe(
      'A brief overall summary of the comparison, highlighting key differences and potential considerations for an investor.'
    ),
  disclaimer: z.string().default("This AI-generated comparison is for informational purposes only and not financial advice. DYOR.").describe("Standard disclaimer.")
});
export type CompareMemeCoinsOutput = z.infer<typeof CompareMemeCoinsOutputSchema>;

export async function compareMemeCoins(input: CompareMemeCoinsInput): Promise<CompareMemeCoinsOutput> {
  return compareMemeCoinsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'compareMemeCoinsPrompt',
  input: {schema: CompareMemeCoinsInputSchema},
  output: {schema: CompareMemeCoinsOutputSchema},
  prompt: `You are a cryptocurrency analyst specializing in meme coins. Compare {{{coin1Name}}} and {{{coin2Name}}}.
Provide a detailed comparison table covering aspects like:
- Current Price (if known, state as N/A or estimated if not)
- Market Capitalization (if known)
- Underlying Technology/Blockchain
- Community Size & Sentiment (general feel)
- Primary Use Case / "Meme Factor"
- Recent News/Developments (if any significant)
- Potential Upside (speculative)
- Key Risks & Concerns
- Tokenomics (briefly, if notable differences)

After the table, provide an 'overallSummary' highlighting the main distinctions and who might prefer which coin.
Always include the 'disclaimer'.
Format your response according to the output schema.
If information for a metric is not readily available or highly speculative, state so (e.g., "N/A", "Highly Speculative", "Data Unavailable").
`,
});

const compareMemeCoinsFlow = ai.defineFlow(
  {
    name: 'compareMemeCoinsFlow',
    inputSchema: CompareMemeCoinsInputSchema,
    outputSchema: CompareMemeCoinsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This AI-generated comparison is for informational purposes only and not financial advice. DYOR.";
    }
    return output!;
  }
);
