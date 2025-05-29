
'use server';
/**
 * @fileOverview An AI agent that calculates potential profit/loss for a crypto investment scenario.
 *
 * - calculateFutureProfit - Calculates profit/loss and provides AI commentary.
 * - CalculateFutureProfitInput - Input type.
 * - CalculateFutureProfitOutput - Output type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CalculateFutureProfitInputSchema = z.object({
  coinName: z.string().describe('The name of the cryptocurrency.'),
  buyPrice: z.number().positive().describe('The price at which the coin was or will be purchased (USD).'),
  quantity: z.number().positive().describe('The quantity of the coin purchased.'),
  targetPrice: z.number().positive().describe('The future target price for the coin (USD).'),
});
export type CalculateFutureProfitInput = z.infer<typeof CalculateFutureProfitInputSchema>;

const CalculateFutureProfitOutputSchema = z.object({
  coinName: z.string().describe("The name of the coin analyzed."),
  buyPrice: z.number().describe("The buy price used in calculation."),
  quantity: z.number().describe("The quantity used in calculation."),
  targetPrice: z.number().describe("The target price used in calculation."),
  totalInvestmentUSD: z.number().describe('The total initial investment in USD.'),
  totalValueAtTargetUSD: z.number().describe('The total value of the coins at the target price in USD.'),
  netProfitOrLossUSD: z.number().describe('The net profit or loss in USD (can be negative).'),
  roiPercentage: z.number().describe('The Return on Investment (ROI) as a percentage (e.g., 25 for 25%, -10 for -10%).'),
  realismCommentary: z.string().describe('AI commentary on the market conditions or factors required for this target price to be realistic.'),
  riskAnalysis: z.string().describe('AI analysis of the risks involved in this scenario, considering volatility and historical behavior if known.'),
  disclaimer: z.string().default("This is an AI-generated estimation for informational purposes only and not financial advice. Market conditions are volatile and outcomes can vary significantly.").describe("Standard disclaimer."),
});
export type CalculateFutureProfitOutput = z.infer<typeof CalculateFutureProfitOutputSchema>;

export async function calculateFutureProfit(input: CalculateFutureProfitInput): Promise<CalculateFutureProfitOutput> {
  return calculateFutureProfitFlow(input);
}

const prompt = ai.definePrompt({
  name: 'calculateFutureProfitPrompt',
  input: {schema: CalculateFutureProfitInputSchema},
  output: {schema: CalculateFutureProfitOutputSchema},
  prompt: `You are an AI Investment Coach.

A user wants to estimate potential profit/loss for a crypto investment.
Given the following input:
- Coin Name: {{{coinName}}}
- Buy Price: {{{buyPrice}}} USD
- Quantity Purchased: {{{quantity}}}
- Future Target Price: {{{targetPrice}}} USD

Your task is to:
1.  Calculate 'totalInvestmentUSD': buyPrice * quantity.
2.  Calculate 'totalValueAtTargetUSD': targetPrice * quantity.
3.  Calculate 'netProfitOrLossUSD': totalValueAtTargetUSD - totalInvestmentUSD.
4.  Calculate 'roiPercentage': (netProfitOrLossUSD / totalInvestmentUSD) * 100. Format this as a number (e.g., 25 for 25%, -10 for -10%).
5.  Provide 'realismCommentary': Briefly discuss what market conditions, news, or specific coin developments might be necessary for the target price of {{{targetPrice}}} USD for {{{coinName}}} to be realistically achieved from the buy price of {{{buyPrice}}} USD.
6.  Provide 'riskAnalysis': Briefly analyze the potential risks involved in aiming for this target. Consider factors like the coin's typical volatility (if it's a known meme coin, assume high volatility), the magnitude of the price change, and general market risks.
7.  Ensure the output 'coinName', 'buyPrice', 'quantity', and 'targetPrice' fields in the response match the input values.
8.  Include the standard 'disclaimer'.

Format your response strictly according to the JSON output schema.
Perform calculations accurately. Round monetary values to 2 decimal places and ROI percentage to 2 decimal places where appropriate in your calculations, but the schema expects numbers for these fields.
`,
});

const calculateFutureProfitFlow = ai.defineFlow(
  {
    name: 'calculateFutureProfitFlow',
    inputSchema: CalculateFutureProfitInputSchema,
    outputSchema: CalculateFutureProfitOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output) {
        // Ensure disclaimer is always present
        if (!output.disclaimer) {
            output.disclaimer = "This is an AI-generated estimation for informational purposes only and not financial advice. Market conditions are volatile and outcomes can vary significantly.";
        }
        // Optional: Server-side re-calculation for critical numeric fields if AI struggles with precision
        // This can be useful if the LLM is sometimes off with math.
        const totalInvestment = input.buyPrice * input.quantity;
        const totalValueAtTarget = input.targetPrice * input.quantity;
        const netProfitOrLoss = totalValueAtTarget - totalInvestment;
        const roi = totalInvestment !== 0 ? (netProfitOrLoss / totalInvestment) * 100 : 0;

        output.totalInvestmentUSD = parseFloat(totalInvestment.toFixed(2));
        output.totalValueAtTargetUSD = parseFloat(totalValueAtTarget.toFixed(2));
        output.netProfitOrLossUSD = parseFloat(netProfitOrLoss.toFixed(2));
        output.roiPercentage = parseFloat(roi.toFixed(2));
        
        // Ensure input values are echoed back in the output
        output.coinName = input.coinName;
        output.buyPrice = input.buyPrice;
        output.quantity = input.quantity;
        output.targetPrice = input.targetPrice;
    }
    return output!;
  }
);

