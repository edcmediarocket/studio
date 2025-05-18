
'use server';
/**
 * @fileOverview An AI agent that provides a customized trading signal based on user-defined timeframe and risk profile.
 *
 * - getCustomizedCoinTradingSignal - A function that provides the customized trading signal and analysis.
 * - GetCustomizedCoinTradingSignalInput - The input type.
 * - GetCustomizedCoinTradingSignalOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCustomizedCoinTradingSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin).'),
  timeframe: z.enum(['1H', '4H', '1D', '1W']).describe('The desired trading timeframe for the signal (1 Hour, 4 Hours, 1 Day, 1 Week).'),
  riskProfile: z.enum(['Low', 'Medium', 'High']).describe('The user\'s desired risk profile (Low, Medium, High).'),
});
export type GetCustomizedCoinTradingSignalInput = z.infer<typeof GetCustomizedCoinTradingSignalInputSchema>;

const GetCustomizedCoinTradingSignalOutputSchema = z.object({
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The trading recommendation: Buy, Sell, or Hold, tailored to the inputs.'),
  reasoning: z.string().describe('Concise summary explaining how the selected timeframe and risk profile influenced the recommendation, considering technicals like RSI/EMA, volume, and breakouts.'),
  confidenceScore: z.number().min(0).max(100).int().describe('A numerical confidence score (0-100) for the generated signal.'),
  detailedAnalysis: z.string().describe('In-depth analysis supporting the signal, considering the specified timeframe and risk. This should cover relevant technical (RSI, EMA trends, volume spikes, price breakouts), fundamental, and sentiment factors if applicable for a meme coin.'),
  priceTargets: z.object({
    entryPoint: z.string().optional().describe('Suggested entry price range (e.g., "$0.040-$0.042") if applicable, adjusted for risk/timeframe.'),
    stopLoss: z.string().describe('Crucial stop-loss price to limit potential losses, adjusted for risk/timeframe.'),
    takeProfit1: z.string().describe('First take-profit target, adjusted for risk/timeframe.'),
    takeProfit2: z.string().optional().describe('Second take-profit target, adjusted for risk/timeframe.'),
  }).describe('Specific trading price targets, adjusted for the selected timeframe and risk profile.'),
  strategyNotes: z.string().describe('Specific notes or advice on how to approach trading this signal, considering the user\'s timeframe and risk tolerance (e.g., "For a high-risk, 1H timeframe, consider quick scalping based on observed volume spike." or "For a low-risk, 1W timeframe, look for broader trend confirmations using EMA crosses.").'),
  disclaimer: z.string().default("This AI-generated trading signal is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.").describe("Standard disclaimer.")
});
export type GetCustomizedCoinTradingSignalOutput = z.infer<typeof GetCustomizedCoinTradingSignalOutputSchema>;

export async function getCustomizedCoinTradingSignal(input: GetCustomizedCoinTradingSignalInput): Promise<GetCustomizedCoinTradingSignalOutput> {
  return getCustomizedCoinTradingSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCustomizedCoinTradingSignalPrompt',
  input: {schema: GetCustomizedCoinTradingSignalInputSchema},
  output: {schema: GetCustomizedCoinTradingSignalOutputSchema},
  prompt: `You are an expert AI crypto trading analyst specializing in meme coins.
A user requires a customized trading signal for "{{coinName}}" based on their preferences.

User Preferences:
- Timeframe: {{timeframe}}
- Risk Profile: {{riskProfile}}

Generate a comprehensive trading signal adhering to the JSON output schema.
Your analysis and recommendations MUST be tailored to the user's specified timeframe and risk profile.

Key considerations for your response:
- 'recommendation': Clearly state "Buy", "Sell", or "Hold".
- 'reasoning': Briefly explain how the {{timeframe}} and {{riskProfile}} led to this recommendation. This explanation should incorporate insights from technical indicators such as RSI, EMA trends, price breakouts, and volume spikes, relevant to the chosen timeframe. For example, a 'High' risk profile on a '1H' timeframe might lead to a more aggressive 'Buy' on a small dip if volume spikes and RSI indicate oversold conditions, whereas a 'Low' risk profile on a '1D' timeframe would require stronger confirmation from EMA trends and sustained breakouts.
- 'confidenceScore': Provide an integer score from 0 to 100.
- 'detailedAnalysis': Elaborate on the factors that support your signal. Specifically address how the {{timeframe}} (e.g., short-term indicators like RSI divergence for 1H vs. longer trends like EMA crosses for 1W) and {{riskProfile}} (e.g., tighter stop-losses for high risk, wider for low risk) shape this analysis. Include analysis of price breakouts, volume analysis, RSI levels, and EMA trends. Also consider current sentiment, any relevant news, and tokenomics impact on the selected timeframe.
- 'priceTargets': Provide specific numerical currency values for entry, stop-loss, and take-profit levels. These targets MUST reflect the selected {{timeframe}} and {{riskProfile}}. Shorter timeframes and higher risk might have tighter targets, potentially based on recent breakout levels.
- 'strategyNotes': Offer actionable advice related to executing a trade based on this signal, tailored to the user's inputs. For instance, how might position sizing differ, or what specific chart patterns (like breakouts confirmed by volume) to watch for confirmation on the given timeframe.
- 'disclaimer': Include the standard disclaimer.

If data is scarce for "{{coinName}}" or the combination of timeframe and risk profile makes a specific type of analysis difficult, state this clearly in your analysis.
Prioritize providing realistic and actionable insights for a speculative asset like a meme coin, adjusted for the user's specific request, and heavily influenced by technical factors like price breakouts, volume, RSI, and EMA trends appropriate for the timeframe.
`,
});

const getCustomizedCoinTradingSignalFlow = ai.defineFlow(
  {
    name: 'getCustomizedCoinTradingSignalFlow',
    inputSchema: GetCustomizedCoinTradingSignalInputSchema,
    outputSchema: GetCustomizedCoinTradingSignalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This AI-generated trading signal is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.";
    }
    return output!;
  }
);

