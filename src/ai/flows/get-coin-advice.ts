
'use server';

/**
 * @fileOverview An AI agent that provides advice on a specific meme coin.
 *
 * - getCoinAdvice - A function that provides advice on a specific meme coin.
 * - GetCoinAdviceInput - The input type for the getCoinAdvice function.
 * - GetCoinAdviceOutput - The return type for the getCoinAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCoinAdviceInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to get advice on (e.g., Dogecoin, SHIB). Can be "general crypto" for non-specific questions.'),
  question: z.string().describe('The specific question the user has about the meme coin or crypto topic.'),
  currentPriceUSD: z.number().optional().describe('The current market price of the coin in USD, if available. The AI should use this for context if the question pertains to it.'),
  currentPriceTimestamp: z.string().optional().describe('The timestamp (e.g., human-readable string like "May 16, 2025, 10:30 AM") when the currentPriceUSD was observed. The AI should mention this if available and currentPriceUSD is present.'),
});
export type GetCoinAdviceInput = z.infer<typeof GetCoinAdviceInputSchema>;

const GetCoinAdviceOutputSchema = z.object({
  adviceDetail: z.string().describe('The core advice or answer to the user\'s question.'),
  supportingReasoning: z
    .string()
    .describe(
      'Detailed reasoning behind the advice, including any data points, trends, or factors considered. Explain the "why" behind the advice.'
    ),
  potentialRisks: z
    .array(z.string())
    .describe(
      'Key potential risks associated with the advice or the coin/topic in question that the user should be aware of.'
    ),
  confidenceLevel: z
    .string()
    .describe(
      'The AI\'s confidence in this advice (e.g., High, Medium, Low), with a brief justification if not High.'
    ),
  disclaimer: z.string().default("This is AI-generated advice and not financial advice. Always do your own research (DYOR) before making investment decisions.").describe("Standard disclaimer for financial-related advice.")
});
export type GetCoinAdviceOutput = z.infer<typeof GetCoinAdviceOutputSchema>;

export async function getCoinAdvice(input: GetCoinAdviceInput): Promise<GetCoinAdviceOutput> {
  return getCoinAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCoinAdvicePrompt',
  input: {schema: GetCoinAdviceInputSchema},
  output: {schema: GetCoinAdviceOutputSchema},
  prompt: `You are an expert AI financial analyst specializing in the highly volatile and speculative meme coin market, as well as general cryptocurrency topics.
A user is asking for advice.
Coin/Topic: {{{coinName}}}
Question: {{{question}}}

{{#if currentPriceUSD}}
The user has provided context that {{{coinName}}} was observed trading around {{{currentPriceUSD}}} USD{{#if currentPriceTimestamp}} as of {{{currentPriceTimestamp}}}{{/if}}.
When formulating your 'adviceDetail', if relevant, you should acknowledge this observation. For example: "Regarding {{{coinName}}}, which was noted at approximately {{{currentPriceUSD}}} USD (as of {{{currentPriceTimestamp}}}), the current outlook is..." or "Considering the price of {{{coinName}}} was around {{{currentPriceUSD}}} USD (observed at {{{currentPriceTimestamp}}}), here's the advice:".
Always clarify that cryptocurrency prices are highly volatile and can change rapidly, and the provided price was an observation at a specific time.
{{/if}}

Provide a comprehensive, insightful, and balanced response in the structured JSON format defined by the output schema.

Your 'adviceDetail' should directly answer the user's question.
Your 'supportingReasoning' must be thorough. Explain the factors, data, or market observations that lead to your advice. Mention relevant news, tokenomics, community sentiment, or technical patterns if applicable and known from your general knowledge.
Identify and list key 'potentialRisks'. Meme coins are inherently risky; highlight specific risks relevant to the coin/topic and question.
State your 'confidenceLevel' (High, Medium, or Low) in the provided advice and briefly justify if it's not High.
Always include the standard 'disclaimer'.

**Important Instructions for Time-Sensitive Information:**
- If you are discussing current prices, specific recent events, or any other highly time-sensitive data (even if a 'currentPriceUSD' was provided as context), **clearly state that this information is dynamic and advise the user to check reputable real-time sources** like CoinGecko, CoinMarketCap, or major exchanges for the most up-to-date figures.
- Frame your analysis based on your broader understanding and known patterns, rather than attempting to give precise, live figures you don't have.
- Your 'adviceDetail' should naturally incorporate the provided price and timestamp context if it was given for a specific coin, as guided above.

Strive for clarity, objectivity, and actionable insights, while always emphasizing the speculative nature of meme coins.
If the question is about a non-meme coin topic, adapt your expertise to provide relevant cryptocurrency advice.
If the coin is obscure or data is unavailable from your knowledge base, clearly state that limitations exist in providing specific advice.
`,
});

const getCoinAdviceFlow = ai.defineFlow(
  {
    name: 'getCoinAdviceFlow',
    inputSchema: GetCoinAdviceInputSchema,
    outputSchema: GetCoinAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure disclaimer is always present, even if LLM forgets
    if (output && !output.disclaimer) {
      output.disclaimer = "This is AI-generated advice and not financial advice. Always do your own research (DYOR) before making investment decisions.";
    }
    return output!;
  }
);
