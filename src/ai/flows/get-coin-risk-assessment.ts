
'use server';
/**
 * @fileOverview An AI agent that assesses the risk profile of a given cryptocurrency, including rug pull indicators and sub-scores.
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

  // Sub-scores
  volatilityScore: z.number().min(0).max(100).int().optional().describe('Simulated score (0-100) for price volatility risk. Higher means more volatile/risky.'),
  liquidityScore: z.number().min(0).max(100).int().optional().describe('Simulated score (0-100) for liquidity risk (e.g., low volume, wide spreads leading to slippage). Higher score means higher liquidity risk.'),
  socialSentimentRiskScore: z.number().min(0).max(100).int().optional().describe('Simulated score (0-100) for risks from negative or unstable social sentiment. Higher means more risk from sentiment factors.'),
  projectFundamentalsScore: z.number().min(0).max(100).int().optional().describe('Simulated score (0-100) assessing risks related to project fundamentals (e.g., team, utility, roadmap clarity, tokenomics). Higher score means weaker fundamentals/higher project risk.'),

  // DNA Strip Scores
  marketCapTierScore: z.number().min(0).max(100).int().optional().describe('Score (0-100) representing market cap tier. Higher for larger, more established market caps.'),
  communityStrengthScore: z.number().min(0).max(100).int().optional().describe('Score (0-100) representing community strength, engagement, and size. Higher is stronger.'),
  developerActivityScore: z.number().min(0).max(100).int().optional().describe('Score (0-100) representing simulated developer activity, code commits, and project updates. Higher is more active.'),
  memeStrengthScore: z.number().min(0).max(100).int().optional().describe('Score (0-100) representing the "meme-ability", virality potential, and cultural impact of the coin. Higher means stronger meme potential.'),

  contributingFactors: z
    .array(z.string())
    .describe('Key factors contributing to the assessed risk level (e.g., "High price volatility in the last 30 days", "Low trading volume and liquidity", "History of pump and dump patterns", "Small market capitalization", "Anonymous development team", "Concentrated token holdings among top wallets", "Lack of clear utility or use case").'),
  mitigationSuggestions: z
    .array(z.string())
    .describe('General suggestions for mitigating risks if considering involvement with this coin (e.g., "Consider smaller position sizes", "Set tight stop-loss orders", "Diversify investments", "Conduct thorough personal research beyond this assessment", "Be aware of potential for sudden price drops").'),
  overallAssessment: z
    .string()
    .describe('A comprehensive textual summary explaining the risk level and score, integrating the contributing factors, sub-scores, and rug pull assessment.'),
  assessmentDate: z.string().describe("The date this risk assessment was performed (YYYY-MM-DD)."),

  // Rug Pull Specific Fields
  isHighRugRisk: z.boolean().default(false).describe("Whether the AI assesses a high probability of this coin being a rug pull or scam based on simulated indicators."),
  rugPullWarningSummary: z.string().optional().describe("If 'isHighRugRisk' is true, a concise GPT-generated warning summary highlighting the key red flags (e.g., 'Liquidity not locked. Dev wallet holds 82%. No verified contract. Avoid.'). This field should only be populated if isHighRugRisk is true."),
  liquidityLockStatus: z.string().optional().describe("Simulated liquidity lock status (e.g., 'Liquidity locked for 12 months via UniCrypt', 'No lock detected', 'Liquidity appears to be unlocked', 'Partially locked', 'Not Applicable for this coin type')."),
  devWalletConcentration: z.string().optional().describe("Simulated analysis of developer or top wallet concentration (e.g., 'Top 5 wallets hold 70% of supply, including suspected dev wallets', 'Healthy distribution among holders', 'Data inconclusive for dev wallet tracking')."),
  contractVerified: z.boolean().optional().describe("Simulated status of whether the smart contract source code is verified on a block explorer (e.g., Etherscan, BscScan). 'null' or 'undefined' if not applicable."),
  honeypotIndicators: z.string().optional().describe("Simulated findings related to common honeypot contract code patterns or high/restrictive sell taxes (e.g., 'No common honeypot functions detected', 'Unusual sell tax of 50% found', 'Transfer restrictions present', 'Not a smart contract based token')."),

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
     if (result.isHighRugRisk && !result.rugPullWarningSummary) {
        result.rugPullWarningSummary = "AI has flagged this coin as having multiple indicators associated with high rug pull risk. Extreme caution advised. Verify all aspects independently.";
    }
    if (!result.isHighRugRisk && result.rugPullWarningSummary) {
        // Clear summary if not high risk, to avoid confusion
        result.rugPullWarningSummary = undefined;
    }
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'getCoinRiskAssessmentPrompt',
  input: {schema: GetCoinRiskAssessmentInputSchema},
  output: {schema: GetCoinRiskAssessmentOutputSchema},
  prompt: `You are an AI Crypto Risk Analyst with expertise in identifying potential scams and rug pulls, particularly within the meme coin space. Your task is to provide a detailed risk assessment for the cryptocurrency: "{{coinName}}".

Simulate a comprehensive analysis considering the following factors and generate corresponding sub-scores (0-100, higher score = higher risk for that factor if applicable, or weaker fundamentals):
-   **Volatility**: Historical price fluctuations, recent sharp movements. Generate 'volatilityScore'.
-   **Liquidity**: Trading volume, exchange listings, ease of buying/selling. Generate 'liquidityScore'.
-   **Social Sentiment Risk**: Risks from unstable or predominantly negative social sentiment. Generate 'socialSentimentRiskScore'.
-   **Project Fundamentals**: Clarity of use case, development team reputation (if known/anonymous), community strength, roadmap progress, tokenomics. Generate 'projectFundamentalsScore' (higher score indicates weaker fundamentals/higher project risk).
-   **Market Capitalization**: Smaller caps are generally riskier.
-   **Pump & Dump History**: Past instances of rapid, coordinated price manipulation followed by a crash.
-   **On-Chain Metrics (Simulated)**: Holder distribution (whale concentration), tokenomics (inflation/deflation), developer activity.
-   **External Factors**: Regulatory news, broader market sentiment.

**Crucially, you must also analyze for Rug Pull Indicators:**
-   **Liquidity Lock Status**: Simulate checking if liquidity is locked and for how long.
-   **Dev Wallet Concentration**: Simulate analysis of developer wallet holdings.
-   **Smart Contract Verification**: Simulate checking if the contract source code is verified.
-   **Honeypot Indicators**: Simulate scanning for common honeypot characteristics.

**Additionally, generate "Token DNA Strip" scores (0-100):**
-   **marketCapTierScore**: Based on its market cap. Higher for larger caps (e.g., >$1B = 80-100, $100M-$1B = 60-80, $10M-$100M = 40-60, <$10M = 0-40).
-   **communityStrengthScore**: Assess social media presence, engagement, and member counts.
-   **developerActivityScore**: Simulate assessing GitHub commits, protocol updates, and roadmap progress.
-   **memeStrengthScore**: Assess its virality, cultural relevance, and uniqueness of its meme.

Based on your simulated analysis, generate a risk assessment adhering to the JSON output schema.

Key instructions for output fields:
-   'riskLevel': Classify the overall risk.
-   'riskScore': An integer from 0 (lowest risk) to 100 (highest risk). This should correlate with 'riskLevel' and be informed by the sub-scores and DNA scores.
-   Populate all sub-scores and DNA scores.
-   'isHighRugRisk': Set to 'true' if your simulated analysis indicates a high probability of rug pull based on multiple red flags.
-   'rugPullWarningSummary': If 'isHighRugRisk' is true, provide a concise summary of the key red flags.
-   Populate 'liquidityLockStatus', 'devWalletConcentration', 'contractVerified', 'honeypotIndicators' based on your simulated analysis. If a factor is not applicable (e.g., contract for Bitcoin), state so.
-   'contributingFactors': List 3-5 specific, distinct factors that most significantly contribute to the overall risk.
-   'mitigationSuggestions': Provide 2-4 actionable, general suggestions.
-   'overallAssessment': A 2-4 sentence summary that justifies the risk level and score, weaving in the primary contributing factors, the general impact of the sub-scores, DNA scores, AND the rug pull assessment.
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
    }
    return output!;
  }
);

