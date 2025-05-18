
'use server';

/**
 * @fileOverview Predicts the potential ROI of a meme coin using AI estimates.
 *
 * - predictMemeCoinRoi - A function that predicts the ROI of a meme coin.
 * - PredictMemeCoinRoiInput - The input type for the predictMemeCoinRoi function.
 * - PredictMemeCoinRoiOutput - The return type for the predictMemeCoinRoi function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictMemeCoinRoiInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin, Bonk).'),
  investmentAmount: z.number().positive().describe('The amount of investment in USD (must be positive).'),
  predictionHorizon: z
    .string()
    .describe(
      'The prediction horizon for the ROI (e.g., "1 week", "1 month", "6 months", "1 year").'
    ),
});
export type PredictMemeCoinRoiInput = z.infer<
  typeof PredictMemeCoinRoiInputSchema
>;

const PredictMemeCoinRoiOutputSchema = z.object({
  predictedRoi: z
    .number()
    .describe(
      'The predicted Return on Investment (ROI) as a decimal (e.g., 0.1 for 10% ROI, -0.05 for -5% ROI). Can be negative.'
    ),
  predictedValue: z
    .number()
    .describe('The predicted total value of the investment after the prediction horizon in USD.'),
  confidenceLevel: z
    .string()
    .describe('The AI\'s confidence level in this prediction (e.g., High, Medium, Low).'),
  detailedReasoning: z
    .string()
    .describe(
      'A comprehensive explanation for the prediction. This should include analysis of factors like tokenomics (supply, distribution, burn mechanisms), current market trends, recent news or developments, community activity and sentiment, project roadmap and team (if known), technical chart patterns (if applicable and discernible for meme coins), and overall crypto market conditions.'
    ),
  riskFactors: z
    .array(z.string())
    .describe(
      'Specific risk factors that could negatively impact the actual ROI compared to the prediction (e.g., "High market volatility", "Lack of utility", "Influencer pump and dump schemes").'
    ),
  potentialCatalysts: z
    .array(z.string())
    .describe(
      'Potential positive catalysts that could enhance the actual ROI (e.g., "Upcoming exchange listing", "Viral social media trend", "New utility announcement").'
    ),
  alternativeScenarios: z
    .object({
      optimisticRoi: z.number().describe('Predicted ROI in an optimistic scenario (decimal format).'),
      pessimisticRoi: z.number().describe('Predicted ROI in a pessimistic scenario (decimal format).'),
    })
    .describe('Potential ROI outcomes under more optimistic and pessimistic market conditions or coin-specific developments.'),
   disclaimer: z.string().default("ROI predictions for meme coins are highly speculative and not financial advice. Past performance is not indicative of future results. Invest only what you can afford to lose.").describe("Standard disclaimer for ROI predictions.")
});
export type PredictMemeCoinRoiOutput = z.infer<
  typeof PredictMemeCoinRoiOutputSchema
>;

export async function predictMemeCoinRoi(
  input: PredictMemeCoinRoiInput
): Promise<PredictMemeCoinRoiOutput> {
  return predictMemeCoinRoiFlow(input);
}

const predictMemeCoinRoiPrompt = ai.definePrompt({
  name: 'predictMemeCoinRoiPrompt',
  input: {schema: PredictMemeCoinRoiInputSchema},
  output: {schema: PredictMemeCoinRoiOutputSchema},
  prompt: `You are an AI financial analyst specializing in predictive modeling for highly speculative meme coins.
Your task is to predict the potential Return on Investment (ROI) for a given meme coin.

Coin Name: {{{coinName}}}
Investment Amount (USD): {{{investmentAmount}}}
Prediction Horizon: {{{predictionHorizon}}}

Provide your response in the structured JSON format defined by the output schema. Ensure all fields are populated accurately and thoughtfully.

For 'detailedReasoning', provide a thorough, multi-faceted analysis. Consider:
- Tokenomics: Supply metrics, distribution, utility (if any), burn mechanisms.
- Market Sentiment & Community: Social media trends, hype levels, community engagement and size.
- Recent News & Developments: Partnerships, exchange listings, roadmap progress.
- Technical Analysis (if applicable): Basic chart patterns, support/resistance levels, though acknowledge limitations for meme coins.
- Broader Market Conditions: Overall crypto market sentiment, Bitcoin's performance, relevant narratives.

For 'riskFactors' and 'potentialCatalysts', list specific, actionable points.
For 'alternativeScenarios', provide plausible ROI figures for significantly more optimistic and pessimistic outcomes than your main prediction.
Always include the standard 'disclaimer'.

Your predictions should be grounded in as much available data and logical inference as possible, while explicitly acknowledging the extreme volatility and unpredictability inherent in meme coins.
If the coin is very new or lacks data, state this limitation clearly and adjust confidence accordingly.
`,
});

const predictMemeCoinRoiFlow = ai.defineFlow(
  {
    name: 'predictMemeCoinRoiFlow',
    inputSchema: PredictMemeCoinRoiInputSchema,
    outputSchema: PredictMemeCoinRoiOutputSchema,
  },
  async input => {
    const {output} = await predictMemeCoinRoiPrompt(input);
     // Ensure disclaimer is always present
    if (output && !output.disclaimer) {
      output.disclaimer = "ROI predictions for meme coins are highly speculative and not financial advice. Past performance is not indicative of future results. Invest only what you can afford to lose.";
    }
    return output!;
  }
);

