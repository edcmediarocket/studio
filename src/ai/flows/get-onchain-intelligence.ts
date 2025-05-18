
'use server';
/**
 * @fileOverview An AI agent that provides a simulated On-Chain Intelligence Score (OCIS) for a coin.
 *
 * - getOnChainIntelligence - A function that generates OCIS data.
 * - GetOnChainIntelligenceInput - The input type.
 * - GetOnChainIntelligenceOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetOnChainIntelligenceInputSchema = z.object({
  coinName: z.string().describe('The name of the coin to analyze (e.g., Dogecoin, Ethereum).'),
});
export type GetOnChainIntelligenceInput = z.infer<typeof GetOnChainIntelligenceInputSchema>;

const GetOnChainIntelligenceOutputSchema = z.object({
  coinName: z.string().describe('The name of the coin analyzed.'),
  ocisScore: z
    .number()
    .min(0)
    .max(100)
    .int()
    .describe('The overall On-Chain Intelligence Score (0-100), representing a blend of smart money activity, whale behavior, and contract health.'),
  ocisInterpretation: z
    .string()
    .describe('A textual explanation of what the OCIS score implies for the coin (e.g., "High OCIS score suggests strong smart money accumulation with positive whale sentiment and robust contract health.").'),
  whaleMomentumIndex: z
    .number()
    .min(-100)
    .max(100)
    .int()
    .describe('Whale Momentum Index (-100 to +100). Positive indicates net whale buying/accumulation, negative indicates net selling/distribution. Around 0 is neutral.'),
  wmiInterpretation: z
    .string()
    .describe('Interpretation of the Whale Momentum Index (e.g., "Strong net buying pressure from large wallets observed.", "Whales appear to be distributing their holdings.").'),
  smartWalletAccumulationScore: z
    .number()
    .min(0)
    .max(100)
    .int()
    .describe('Smart Wallet Accumulation Score (0-100), indicating the degree of accumulation by historically profitable or influential wallets (simulated).'),
  swasInterpretation: z
    .string()
    .describe('Interpretation of the Smart Wallet Accumulation Score (e.g., "Significant accumulation by wallets with a strong track record.", "Limited activity from known smart money addresses.").'),
  contractAuditInsights: z.object({
    riskLevel: z
      .enum(['Low', 'Medium', 'High', 'Critical', 'Not Applicable'])
      .describe('Simulated smart contract risk level based on common vulnerabilities and best practices. "Not Applicable" if the coin is not based on smart contracts (e.g. Bitcoin).'),
    summary: z
      .string()
      .describe('A brief summary of the simulated contract audit findings (e.g., "No major vulnerabilities detected in simulated audit.", "Simulated audit flags potential reentrancy vector and outdated dependencies.").'),
    lastSimulatedAudit: z.string().describe('The date the simulated audit assessment was performed.'),
  }),
  dataCaveat: z
    .string()
    .default('OCIS and related metrics are AI-simulated based on general on-chain principles and do not reflect real-time, exhaustive on-chain analysis. DYOR.')
    .describe('Disclaimer about the simulated nature of the on-chain intelligence.'),
});
export type GetOnChainIntelligenceOutput = z.infer<typeof GetOnChainIntelligenceOutputSchema>;

export async function getOnChainIntelligence(input: GetOnChainIntelligenceInput): Promise<GetOnChainIntelligenceOutput> {
  return getOnChainIntelligenceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getOnChainIntelligencePrompt',
  input: {schema: GetOnChainIntelligenceInputSchema},
  output: {schema: GetOnChainIntelligenceOutputSchema},
  prompt: `You are an advanced AI On-Chain Intelligence Analyst. For the coin "{{coinName}}", generate a comprehensive On-Chain Intelligence Score (OCIS) and related metrics.
Your analysis should simulate the fusion of various on-chain data points.

Your output must strictly follow the JSON schema.

Key Metrics to Generate:
1.  'ocisScore' (0-100): An overall score. Higher scores indicate healthier on-chain activity, significant smart money interest, and lower contract risk.
2.  'ocisInterpretation': Explain what the 'ocisScore' means for {{coinName}}.
3.  'whaleMomentumIndex' (-100 to +100): Simulate net whale buying (+ve) or selling (-ve).
4.  'wmiInterpretation': Interpret the WMI.
5.  'smartWalletAccumulationScore' (0-100): Simulate accumulation by historically successful wallets.
6.  'swasInterpretation': Interpret the SWAS.
7.  'contractAuditInsights':
    *   'riskLevel': ('Low', 'Medium', 'High', 'Critical', 'Not Applicable'). If {{coinName}} is like Bitcoin (not primarily a smart contract platform), use 'Not Applicable'.
    *   'summary': Briefly describe simulated audit findings. E.g., "No major issues found", "Minor gas optimization suggestions", "Potential reentrancy vulnerability flagged".
    *   'lastSimulatedAudit': This will be set programmatically to the current date.

Considerations for your simulation:
-   **Smart Money vs. Retail FOMO**: The OCIS should reflect a balance. High smart money activity is good, but if it's coupled with extreme retail FOMO, the score might be tempered.
-   **Token Transfers**: Large inflows to exchanges might signal selling pressure, while outflows can indicate accumulation.
-   **Smart Contract Interactions**: For platform tokens (e.g., ETH, SOL), high network activity and dApp interaction is positive. For meme coins on such platforms, liquidity pool depth and contract interactions (like staking if available) are relevant.
-   **Whale Behavior**: Are whales accumulating, distributing, or wash trading?
-   **Token Age/Distribution**: Consider how token age and holder distribution might influence the interpretation.

Ensure 'coinName' in the output matches the input.
Include the 'dataCaveat'.
If "{{coinName}}" is a coin like Bitcoin that doesn't have its own complex smart contract ecosystem in the same way as Ethereum-based tokens, set 'contractAuditInsights.riskLevel' to 'Not Applicable' and provide a relevant 'summary' like "Core protocol robust; individual user wallet security is primary concern." or "Not a smart contract platform; focus is on network security and hashrate."
`,
});

const getOnChainIntelligenceFlow = ai.defineFlow(
  {
    name: 'getOnChainIntelligenceFlow',
    inputSchema: GetOnChainIntelligenceInputSchema,
    outputSchema: GetOnChainIntelligenceOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output) {
      output.coinName = input.coinName;
      output.contractAuditInsights.lastSimulatedAudit = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      if (!output.dataCaveat) {
        output.dataCaveat = 'OCIS and related metrics are AI-simulated based on general on-chain principles and do not reflect real-time, exhaustive on-chain analysis. DYOR.';
      }
    }
    return output!;
  }
);
