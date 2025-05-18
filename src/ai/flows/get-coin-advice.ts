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
  coinName: z.string().describe('The name of the meme coin to get advice on.'),
  question: z.string().describe('The question to ask about the meme coin.'),
});
export type GetCoinAdviceInput = z.infer<typeof GetCoinAdviceInputSchema>;

const GetCoinAdviceOutputSchema = z.object({
  answer: z.string().describe('The answer to the question about the meme coin.'),
});
export type GetCoinAdviceOutput = z.infer<typeof GetCoinAdviceOutputSchema>;

export async function getCoinAdvice(input: GetCoinAdviceInput): Promise<GetCoinAdviceOutput> {
  return getCoinAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCoinAdvicePrompt',
  input: {schema: GetCoinAdviceInputSchema},
  output: {schema: GetCoinAdviceOutputSchema},
  prompt: `You are an AI assistant specializing in providing advice on meme coins.\n\nCoin Name: {{{coinName}}}\nQuestion: {{{question}}}\n\nAnswer:`,
});

const getCoinAdviceFlow = ai.defineFlow(
  {
    name: 'getCoinAdviceFlow',
    inputSchema: GetCoinAdviceInputSchema,
    outputSchema: GetCoinAdviceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
