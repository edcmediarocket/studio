'use server';

/**
 * @fileOverview This flow analyzes the social sentiment around a specific meme coin.
 *
 * - analyzeMemeCoinSentiment - A function that analyzes meme coin sentiment.
 * - AnalyzeMemeCoinSentimentInput - The input type for the analyzeMemeCoinSentiment function.
 * - AnalyzeMemeCoinSentimentOutput - The return type for the analyzeMemeCoinSentiment function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeMemeCoinSentimentInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to analyze.'),
});
export type AnalyzeMemeCoinSentimentInput = z.infer<
  typeof AnalyzeMemeCoinSentimentInputSchema
>;

const AnalyzeMemeCoinSentimentOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe(
      'Overall sentiment towards the meme coin (positive, negative, neutral).'
    ),
  sentimentBreakdown: z
    .string()
    .describe(
      'Detailed breakdown of sentiment from different social media platforms (Twitter, Reddit, etc.).'
    ),
  keyDiscussionPoints: z
    .string()
    .describe(
      'Key discussion points and topics surrounding the meme coin on social media.'
    ),
});
export type AnalyzeMemeCoinSentimentOutput = z.infer<
  typeof AnalyzeMemeCoinSentimentOutputSchema
>;

export async function analyzeMemeCoinSentiment(
  input: AnalyzeMemeCoinSentimentInput
): Promise<AnalyzeMemeCoinSentimentOutput> {
  return analyzeMemeCoinSentimentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeMemeCoinSentimentPrompt',
  input: {schema: AnalyzeMemeCoinSentimentInputSchema},
  output: {schema: AnalyzeMemeCoinSentimentOutputSchema},
  prompt: `Analyze the social sentiment around the meme coin {{coinName}} from platforms like Twitter and Reddit. Provide an overall sentiment, a breakdown of sentiment from different platforms, and key discussion points.\n\nConsider factors such as the volume of mentions, the emotional tone of the mentions, and the credibility of the sources.`,
});

const analyzeMemeCoinSentimentFlow = ai.defineFlow(
  {
    name: 'analyzeMemeCoinSentimentFlow',
    inputSchema: AnalyzeMemeCoinSentimentInputSchema,
    outputSchema: AnalyzeMemeCoinSentimentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
