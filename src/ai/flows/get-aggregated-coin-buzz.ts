'use server';
/**
 * @fileOverview An AI agent that aggregates and analyzes recent news and social media buzz for a meme coin.
 *
 * - getAggregatedCoinBuzz - A function that fetches and analyzes coin buzz.
 * - GetAggregatedCoinBuzzInput - The input type.
 * - GetAggregatedCoinBuzzOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAggregatedCoinBuzzInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to aggregate buzz for (e.g., Dogecoin).'),
});
export type GetAggregatedCoinBuzzInput = z.infer<typeof GetAggregatedCoinBuzzInputSchema>;

const GetAggregatedCoinBuzzOutputSchema = z.object({
  coinName: z.string().describe('The name of the coin analyzed.'),
  analysisDate: z.string().describe('The simulated date of the analysis (e.g., "As of October 26, 2023").'),
  keyNewsHighlights: z
    .array(z.string())
    .describe('Bulleted list of 3-5 key news highlights or announcements from the last 7-14 days.'),
  socialMediaThemes: z
    .array(z.string())
    .describe('Bulleted list of 3-5 dominant discussion themes observed on platforms like Twitter, Reddit, Telegram in the recent period.'),
  overallBuzzSentiment: z
    .enum(['Very Positive', 'Positive', 'Neutral', 'Negative', 'Very Negative', 'Mixed'])
    .describe('Overall qualitative sentiment of the aggregated buzz.'),
  buzzScore: z
    .number()
    .min(-100)
    .max(100)
    .int()
    .describe('A numerical score from -100 (extremely negative) to 100 (extremely positive) representing the aggregated buzz intensity and sentiment, with 0 being neutral.'),
  emergingNarratives: z
    .array(z.string())
    .describe('List any new or rapidly growing narratives, FUD, or hype points observed.'),
  significantEventsMentioned: z
    .array(z.string())
    .describe('List any specific upcoming or recent events frequently mentioned (e.g., AMA, token burn, partnership).'),
  dataSourcesNote: z
    .string()
    .default('Insights are AI-synthesized based on simulated scanning of public news and social media data, not direct real-time feeds.')
    .describe('A note about the nature of data sourcing.'),
  disclaimer: z
    .string()
    .default('This AI-generated buzz aggregation is for informational purposes only and not financial advice. DYOR.')
    .describe('Standard disclaimer.'),
});
export type GetAggregatedCoinBuzzOutput = z.infer<typeof GetAggregatedCoinBuzzOutputSchema>;

export async function getAggregatedCoinBuzz(input: GetAggregatedCoinBuzzInput): Promise<GetAggregatedCoinBuzzOutput> {
  return getAggregatedCoinBuzzFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getAggregatedCoinBuzzPrompt',
  input: {schema: GetAggregatedCoinBuzzInputSchema},
  output: {schema: GetAggregatedCoinBuzzOutputSchema},
  prompt: `You are an AI Crypto Analyst specializing in aggregating and interpreting news and social media buzz for meme coins.
For the coin "{{coinName}}", provide a comprehensive analysis of its recent buzz.
Simulate that you have scanned major news outlets, crypto news sites, Twitter, Reddit, Telegram, and other relevant social channels for information from the last 7-14 days.

Your output must strictly follow the JSON schema.

Key Instructions:
-   'analysisDate': Set this to today's date in a human-readable format (e.g., "As of October 26, 2023").
-   'keyNewsHighlights': Identify 3-5 major, distinct news items. If no significant news, state "No major news highlights identified in the recent period."
-   'socialMediaThemes': Summarize 3-5 prevalent discussion topics.
-   'overallBuzzSentiment': Classify the general feeling.
-   'buzzScore': Assign a numerical score from -100 to 100. Consider both volume and sentiment. High positive volume is high positive score, high negative volume is high negative score, low volume or mixed is closer to 0.
-   'emergingNarratives': Note any new trends in discussion.
-   'significantEventsMentioned': List specific, concrete events.
-   Ensure 'dataSourcesNote' and 'disclaimer' are included.

Focus on factual-sounding summaries for news and common patterns of discussion for social themes. Avoid making up extremely specific or unverifiable details.
The goal is to provide a snapshot of what the current conversation around "{{coinName}}" looks like.
`,
});

const getAggregatedCoinBuzzFlow = ai.defineFlow(
  {
    name: 'getAggregatedCoinBuzzFlow',
    inputSchema: GetAggregatedCoinBuzzInputSchema,
    outputSchema: GetAggregatedCoinBuzzOutputSchema,
  },
  async input => {
    // Simulate setting current date for analysisDate
    const analysisDate = `As of ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;
    
    const {output} = await prompt(input);

    if (output) {
      output.analysisDate = analysisDate; // Ensure the date is set
      if (!output.disclaimer) {
        output.disclaimer = 'This AI-generated buzz aggregation is for informational purposes only and not financial advice. DYOR.';
      }
      if (!output.dataSourcesNote) {
        output.dataSourcesNote = 'Insights are AI-synthesized based on simulated scanning of public news and social media data, not direct real-time feeds.';
      }
      // Ensure coinName is present in output
      output.coinName = input.coinName; 
    }
    return output!;
  }
);