
'use server';
/**
 * @fileOverview An AI agent that detects emerging narratives for a given topic or coin.
 *
 * - getMarketNarratives - A function that detects market narratives.
 * - GetMarketNarrativesInput - The input type for the getMarketNarratives function.
 * - GetMarketNarrativesOutput - The return type for the getMarketNarratives function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetMarketNarrativesInputSchema = z.object({
  topic: z.string().describe('The topic, market segment, or specific coin name to analyze for narratives (e.g., "Meme Coins", "Solana Ecosystem", "Dogecoin").'),
});
export type GetMarketNarrativesInput = z.infer<typeof GetMarketNarrativesInputSchema>;

const MarketNarrativeSchema = z.object({
  narrative: z.string().describe('A concise description of the detected narrative (e.g., "AI-related tokens are gaining strong momentum", "Investors are rotating out of L1s into L2s").'),
  strength: z.enum(['Strong', 'Growing', 'Fading', 'Speculative']).describe('The perceived current strength or lifecycle stage of the narrative.'),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral', 'Mixed']).describe('The general sentiment associated with this narrative.'),
  potentialImpact: z.string().describe('A brief analysis of how this narrative might influence market behavior, prices, or specific coin categories.'),
  keyEvidenceSnippets: z.array(z.string()).max(3).describe('Up to 3 simulated snippets of text (e.g., from social media, news headlines) that support or exemplify this narrative.'),
});
export type MarketNarrative = z.infer<typeof MarketNarrativeSchema>;

const GetMarketNarrativesOutputSchema = z.object({
  analyzedTopic: z.string().describe('The topic that was analyzed.'),
  detectedNarratives: z
    .array(MarketNarrativeSchema)
    .describe('A list of detected emerging or current market narratives related to the topic.'),
  overallMarketPsychology: z
    .string()
    .describe('A summary of the general market psychology or mood related to the analyzed topic, based on the detected narratives.'),
  confidence: z
    .enum(['High', 'Medium', 'Low'])
    .describe("The AI's confidence level in the accuracy and relevance of the detected narratives and psychology assessment."),
  analysisDate: z.string().describe("The date this narrative analysis was performed."),
  disclaimer: z
    .string()
    .default('Narrative detection is AI-simulated based on general market understanding and does not constitute financial advice. Narratives can shift rapidly.')
    .describe('Standard disclaimer for narrative analysis.'),
});
export type GetMarketNarrativesOutput = z.infer<typeof GetMarketNarrativesOutputSchema>;

export async function getMarketNarratives(input: GetMarketNarrativesInput): Promise<GetMarketNarrativesOutput> {
  return getMarketNarrativesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getMarketNarrativesPrompt',
  input: {schema: GetMarketNarrativesInputSchema},
  output: {schema: GetMarketNarrativesOutputSchema},
  prompt: `You are an expert AI Market Narrative Analyst. Your task is to identify, analyze, and report on emerging or current narratives related to the following topic: "{{topic}}".
A "narrative" is a prevailing story, theme, or belief that is influencing market sentiment and potentially driving investment decisions. Go beyond simple keyword sentiment; analyze the contextual meaning in simulated trending posts, news, and discussions to detect these narratives.

For the given "{{topic}}", provide:
1.  'detectedNarratives': A list of distinct narratives. For each narrative:
    *   'narrative': A clear, concise description (e.g., "Dog coins are making a comeback," "Sustainability and green crypto projects are undervalued," "Community concerns growing over ETH centralization").
    *   'strength': Classify its current strength ('Strong', 'Growing', 'Fading', 'Speculative').
    *   'sentiment': Classify the sentiment it generally evokes ('Positive', 'Negative', 'Neutral', 'Mixed').
    *   'potentialImpact': Briefly explain its potential influence on the market or specific assets.
    *   'keyEvidenceSnippets': Provide 1-3 brief, simulated examples of text (like a tweet, headline, or forum comment) that exemplify this narrative.
2.  'overallMarketPsychology': Summarize the general market psychology or mood concerning "{{topic}}" based on these narratives.
3.  'confidence': Your confidence ('High', 'Medium', 'Low') in this overall narrative assessment.
4.  'analysisDate': This will be set programmatically.
5.  'disclaimer': Include the standard disclaimer.

Focus on identifying underlying stories and psychological drivers. For example, if many people are discussing high gas fees on Ethereum, the narrative might be "Users seeking alternatives to Ethereum due to cost concerns."
If the topic is broad like "Meme Coins", identify general narratives within that space. If specific, like "Dogecoin", focus on narratives surrounding it.
Ensure your response strictly adheres to the JSON output schema.
`,
});

const getMarketNarrativesFlow = ai.defineFlow(
  {
    name: 'getMarketNarrativesFlow',
    inputSchema: GetMarketNarrativesInputSchema,
    outputSchema: GetMarketNarrativesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output) {
      output.analyzedTopic = input.topic;
      output.analysisDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!output.disclaimer) {
        output.disclaimer = 'Narrative detection is AI-simulated based on general market understanding and does not constitute financial advice. Narratives can shift rapidly.';
      }
    }
    return output!;
  }
);
