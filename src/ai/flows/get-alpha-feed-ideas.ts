
'use server';
/**
 * @fileOverview An AI agent that generates "alpha" trade ideas.
 *
 * - getAlphaFeedIdeas - A function that generates a feed of trade ideas.
 * - GetAlphaFeedIdeasInput - The input type (currently empty for a general feed).
 * - GetAlphaFeedIdeasOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetAlphaFeedIdeasInputSchema = z.object({
  // No specific inputs for now, could add filters like category later
  filter: z.string().optional().describe("Optional filter for the feed, e.g., 'meme coins', 'DeFi'.")
});
export type GetAlphaFeedIdeasInput = z.infer<typeof GetAlphaFeedIdeasInputSchema>;

const TradeIdeaSchema = z.object({
  coinName: z.string().describe('The name of the coin or token.'),
  symbol: z.string().describe('The ticker symbol for the coin (e.g., BTC, DOGE).'),
  ideaType: z.enum([
      "High Potential Upside", 
      "Narrative Play", 
      "Contrarian Bet", 
      "Short-Term Momentum",
      "Undervalued Gem",
      "Ecosystem Growth"
    ]).describe('The category or type of trade idea.'),
  signal: z.enum(["Buy", "Accumulate", "Watch", "Consider Short"]).describe('The suggested trading action.'),
  riskRewardProfile: z.enum([
      "High Risk / High Reward", 
      "Medium Risk / Medium Reward", 
      "Low Risk / Calculated Reward",
      "Speculative / Asymmetric Upside"
    ]).describe('The assessed risk vs. reward profile of the idea.'),
  marketConditionContext: z.string().describe('Brief analysis of current overall market conditions relevant to this idea (e.g., "Bullish momentum in broader market", "Altcoin season showing signs", "Market in consolidation phase").'),
  narrativeTimingContext: z.string().describe('Analysis of why the timing for this narrative or coin might be opportune (e.g., "Upcoming mainnet launch creating buzz", "Recent positive sentiment surge aligning with sector rotation", "Under-the-radar narrative gaining traction").'),
  rationale: z.string().describe('Detailed explanation of why this is considered an "alpha" idea, including key catalysts, data points, or unique insights.'),
  confidenceScore: z.number().min(0).max(100).int().describe('AI\'s confidence in this trade idea (0-100).'),
  suggestedTimeframe: z.string().describe('Suggested holding or monitoring timeframe for this idea (e.g., "1-2 weeks", "Next 24-72 hours", "Medium-term hold (1-3 months)").'),
  keyMetricsToWatch: z.array(z.string()).optional().describe("Specific metrics or events to monitor that would support or invalidate the idea.")
});
export type TradeIdea = z.infer<typeof TradeIdeaSchema>;

const GetAlphaFeedIdeasOutputSchema = z.object({
  feedItems: z.array(TradeIdeaSchema).describe('A list of AI-generated trade ideas.'),
  lastGenerated: z.string().describe('Timestamp of when the feed was generated.'),
  disclaimer: z.string().default("These AI-generated trade ideas are for informational and educational purposes only, and do not constitute financial advice. Trading cryptocurrencies is highly speculative and involves substantial risk of loss. Always do your own research (DYOR).")
});
export type GetAlphaFeedIdeasOutput = z.infer<typeof GetAlphaFeedIdeasOutputSchema>;

export async function getAlphaFeedIdeas(input?: GetAlphaFeedIdeasInput): Promise<GetAlphaFeedIdeasOutput> {
  return getAlphaFeedIdeasFlow(input || {});
}

const prompt = ai.definePrompt({
  name: 'getAlphaFeedIdeasPrompt',
  input: {schema: GetAlphaFeedIdeasInputSchema},
  output: {schema: GetAlphaFeedIdeasOutputSchema},
  prompt: `You are an AI Crypto Strategist specializing in identifying "alpha" - high-potential trade ideas with a unique edge.
Generate a feed of 3-5 distinct and actionable trade ideas for various meme coins, altcoins, or crypto narratives.
{{#if filter}}Focus your ideas related to: {{filter}}{{/if}}

For each trade idea, provide:
- 'coinName' and 'symbol'.
- 'ideaType': Classify the idea (e.g., "High Potential Upside", "Narrative Play", "Contrarian Bet", "Short-Term Momentum", "Undervalued Gem", "Ecosystem Growth").
- 'signal': "Buy", "Accumulate", "Watch", or "Consider Short".
- 'riskRewardProfile': Assess the risk/reward (e.g., "High Risk / High Reward", "Speculative / Asymmetric Upside").
- 'marketConditionContext': Briefly explain relevant current market conditions.
- 'narrativeTimingContext': Explain why the timing for this narrative/coin might be opportune.
- 'rationale': A detailed explanation of the "alpha". What is the unique insight or edge? What are the key catalysts or data points supporting this idea? Be specific.
- 'confidenceScore': Your confidence (0-100) in this idea.
- 'suggestedTimeframe': An appropriate timeframe (e.g., "Next 24-72 hours", "1-2 weeks").
- 'keyMetricsToWatch' (optional): 1-2 specific metrics or upcoming events that would support or invalidate the idea.

Ensure the ideas are diverse and insightful.
The 'lastGenerated' timestamp will be set programmatically.
Include the 'disclaimer'.
`,
});

const getAlphaFeedIdeasFlow = ai.defineFlow(
  {
    name: 'getAlphaFeedIdeasFlow',
    inputSchema: GetAlphaFeedIdeasInputSchema,
    outputSchema: GetAlphaFeedIdeasOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output) {
      output.lastGenerated = new Date().toISOString();
      if (!output.disclaimer) {
        output.disclaimer = "These AI-generated trade ideas are for informational and educational purposes only, and do not constitute financial advice. Trading cryptocurrencies is highly speculative and involves substantial risk of loss. Always do your own research (DYOR).";
      }
    }
    return output!;
  }
);
