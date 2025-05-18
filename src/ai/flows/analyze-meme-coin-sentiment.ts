
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
  coinName: z.string().describe('The name of the meme coin to analyze (e.g., Dogecoin, Shiba Inu).'),
});
export type AnalyzeMemeCoinSentimentInput = z.infer<
  typeof AnalyzeMemeCoinSentimentInputSchema
>;

const AnalyzeMemeCoinSentimentOutputSchema = z.object({
  overallSentiment: z
    .string()
    .describe(
      'Overall sentiment classification towards the meme coin (e.g., Very Positive, Positive, Neutral, Negative, Very Negative).'
    ),
  sentimentScore: z
    .number()
    .min(-1)
    .max(1)
    .describe(
      'A numerical score from -1.0 (extremely negative) to 1.0 (extremely positive) representing the sentiment, with 0.0 being neutral.'
    ),
  sentimentBreakdown: z
    .string()
    .describe(
      'Detailed qualitative and quantitative breakdown of sentiment from different social media platforms (e.g., Twitter, Reddit, Telegram). Include estimated percentages of positive/negative/neutral mentions and key themes per platform with illustrative examples if possible.'
    ),
  keyDiscussionPoints: z
    .string()
    .describe(
      'Dominant topics, narratives, and questions being discussed by the community and speculators regarding the meme coin.'
    ),
  emergingThemes: z
    .array(z.string())
    .describe(
      'List of new or rapidly growing discussion themes, concerns, or hype points observed recently.'
    ),
  influencerMentions: z
    .array(
      z.object({
        name: z.string().describe('Name of the influencer or notable account.'),
        platform: z
          .string()
          .describe('Social media platform of the mention (e.g., Twitter, YouTube).'),
        sentiment: z
          .string()
          .describe('Sentiment of the mention (positive, negative, neutral).'),
        summary: z.string().describe('A brief summary of what the influencer said.'),
        linkToMention: z
          .string()
          .optional()
          .describe('A direct link to the mention, if publicly available.'),
      })
    )
    .describe(
      'Mentions by key crypto influencers or notable accounts, including their sentiment and a summary.'
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
  prompt: `You are an expert market sentiment analyst specializing in the volatile and fast-paced meme coin ecosystem. Perform a comprehensive social sentiment analysis for the meme coin: {{coinName}}.
Your analysis must cover major social platforms including Twitter, Reddit, Telegram, and Discord, if relevant data can be inferred.

Provide your analysis in the structured JSON format defined by the output schema. Ensure all fields are populated according to their descriptions.

For 'sentimentBreakdown', offer both quantitative (e.g., estimated percentages of positive/negative/neutral mentions) and qualitative insights (key themes on each platform, with anonymized examples if possible).
For 'influencerMentions', if specific influencers are identified, summarize their stance and provide a link if discoverable.

In your analysis, deeply consider:
*   **Volume and Velocity**: The number of mentions and how quickly discussions are evolving.
*   **Emotional Tone**: The intensity and nature of emotions expressed.
*   **Source Credibility/Influence**: Differentiate between general community chatter and statements from more influential or informed sources.
*   **Engagement Metrics**: Likes, shares, comments on relevant posts.
*   **Spam/Bot Activity**: Attempt to filter out or account for inorganic activity.
*   **Context**: Understand the context of discussions, not just keyword matching.

Your goal is to provide a nuanced, actionable understanding of the social landscape surrounding {{coinName}}.
`,
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

