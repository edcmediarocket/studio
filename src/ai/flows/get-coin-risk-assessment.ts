
'use server';
/**
 * @fileOverview An AI agent that assesses the risk profile of a given cryptocurrency.
 *
 * - getCoinRiskAssessment - A function that provides a risk assessment for a coin.
 * - GetCoinRiskAssessmentInput - The input type for the function.
 * - GetCoinRiskAssessmentOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCoinRiskAssessmentInputSchema = z.object({
  coinName: z.string().describe('The name of the cryptocurrency to assess (e.g., Dogecoin, Bitcoin).'),
});
export type GetCoinRiskAssessmentInput = z.infer<typeof GetCoinRiskAssessmentInputSchema>;

const RiskLevelSchema = z.enum([
    "Low", 
    "Medium", 
    "High", 
    "Very High", 
    "Degenerate Gambler Zone"
]).describe("The AI's overall assessed risk level for the coin.");

const GetCoinRiskAssessmentOutputSchema = z.object({
  coinName: z.string().describe("The name of the coin assessed."),
  riskLevel: RiskLevelSchema,
  riskScore: z.number().min(0).max(100).int().describe('A numerical score from 0 (lowest risk) to 100 (highest risk).'),
  contributingFactors: z
    .array(z.string())
    .describe('Key factors contributing to the assessed risk level (e.g., "High price volatility in the last 30 days", "Low trading volume and liquidity", "History of pump and dump patterns", "Small market capitalization", "Anonymous development team", "Concentrated token holdings among top wallets", "Lack of clear utility or use case").'),
  mitigationSuggestions: z
    .array(z.string())
    .describe('General suggestions for mitigating risks if considering involvement with this coin (e.g., "Consider smaller position sizes", "Set tight stop-loss orders", "Diversify investments", "Conduct thorough personal research beyond this assessment", "Be aware of potential for sudden price drops").'),
  overallAssessment: z
    .string()
    .describe('A comprehensive textual summary explaining the risk level and score, integrating the contributing factors.'),
  assessmentDate: z.string().describe("The date this risk assessment was performed (YYYY-MM-DD)."),
  disclaimer: z
    .string()
    .default('This AI-generated risk assessment is for informational purposes only and not financial advice. Cryptocurrency investments are inherently risky. Always conduct your own thorough research (DYOR) and consult with a financial advisor before making investment decisions.')
    .describe('Standard disclaimer for risk assessment.'),
});
export type GetCoinRiskAssessmentOutput = z.infer<typeof GetCoinRiskAssessmentOutputSchema>;

export async function getCoinRiskAssessment(input: GetCoinRiskAssessmentInput): Promise<GetCoinRiskAssessmentOutput> {
  const result = await getCoinRiskAssessmentFlow(input);
  if (result) {
    result.coinName = input.coinName; // Ensure coin name is in output
    result.assessmentDate = new Date().toISOString().split('T')[0]; // Set current date
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'getCoinRiskAssessmentPrompt',
  input: {schema: GetCoinRiskAssessmentInputSchema},
  output: {schema: GetCoinRiskAssessmentOutputSchema},
  prompt: `You are an AI Crypto Risk Analyst. Your task is to provide a detailed risk assessment for the cryptocurrency: "{{coinName}}".

Simulate a comprehensive analysis considering the following factors:
-   **Volatility**: Historical price fluctuations, recent sharp movements.
-   **Liquidity**: Trading volume, exchange listings, ease of buying/selling without significant price impact.
-   **Pump & Dump History**: Past instances of rapid, coordinated price manipulation followed by a crash.
-   **Market Capitalization**: Smaller caps are generally riskier.
-   **On-Chain Metrics (Simulated)**: Holder distribution (whale concentration), tokenomics (inflation/deflation), smart contract vulnerabilities (if applicable), developer activity.
-   **Project Fundamentals**: Clarity of use case, development team reputation (if known), community strength and sentiment, roadmap progress.
-   **External Factors**: Regulatory news, broader market sentiment.

Based on your simulated analysis, generate a risk assessment adhering to the JSON output schema.

Key instructions for output fields:
-   'riskLevel': Classify the risk (e.g., "Low", "Medium", "High", "Very High", "Degenerate Gambler Zone"). Be discerning; "Degenerate Gambler Zone" should be reserved for extremely speculative assets with multiple red flags.
-   'riskScore': An integer from 0 (lowest risk) to 100 (highest risk). This should correlate with the 'riskLevel'.
-   'contributingFactors': List 3-5 specific, distinct factors that most significantly contribute to the risk. Be precise (e.g., instead of "bad tokenomics," say "High token inflation rate of 20% annually").
-   'mitigationSuggestions': Provide 2-4 actionable, general suggestions for someone considering this coin.
-   'overallAssessment': A 2-4 sentence summary that justifies the risk level and score, weaving in the primary contributing factors.
-   'assessmentDate': This will be set by the system.
-   'disclaimer': Include the standard disclaimer.

For "{{coinName}}", provide your expert risk assessment.
`,
});

const getCoinRiskAssessmentFlow = ai.defineFlow(
  {
    name: 'getCoinRiskAssessmentFlow',
    inputSchema: GetCoinRiskAssessmentInputSchema,
    outputSchema: GetCoinRiskAssessmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output) {
      if (!output.disclaimer) {
        output.disclaimer = 'This AI-generated risk assessment is for informational purposes only and not financial advice. Cryptocurrency investments are inherently risky. Always conduct your own thorough research (DYOR) and consult with a financial advisor before making investment decisions.';
      }
      // The calling function will set coinName and assessmentDate
    }
    return output!;
  }
);
