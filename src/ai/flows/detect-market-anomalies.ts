
'use server';
/**
 * @fileOverview An AI agent that detects and reports market anomalies for a given crypto segment.
 *
 * - detectMarketAnomalies - A function that scans for market anomalies.
 * - DetectMarketAnomaliesInput - The input type for the detectMarketAnomalies function.
 * - DetectMarketAnomaliesOutput - The return type for the detectMarketAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectMarketAnomaliesInputSchema = z.object({
  marketSegment: z.string().describe('The market segment to scan for anomalies (e.g., "Meme Coins", "Top 100 Crypto", "DeFi Tokens").'),
});
export type DetectMarketAnomaliesInput = z.infer<typeof DetectMarketAnomaliesInputSchema>;

const AnomalySchema = z.object({
  coinName: z.string().describe("The name of the coin exhibiting the anomaly."),
  symbol: z.string().describe("The ticker symbol of the coin."),
  anomalyType: z.enum(["Unusual Price Movement", "High Trading Volume", "Social Sentiment Spike", "Liquidity Event", "Security Alert", "Whale Activity Spike"]).describe("The type of anomaly detected."),
  description: z.string().describe("A detailed description of the detected anomaly and its potential implications."),
  severity: z.enum(["Critical", "High", "Medium", "Low"]).describe("The assessed severity of the anomaly."),
  timestamp: z.string().describe("Simulated timestamp of when the anomaly was detected or became significant (e.g., '2 hours ago', '2023-10-27 14:30 UTC')."),
  confidence: z.number().min(0).max(1).describe("AI's confidence in this anomaly detection (0.0 to 1.0).")
});

const DetectMarketAnomaliesOutputSchema = z.object({
  anomalies: z
    .array(AnomalySchema)
    .describe("A list of detected market anomalies."),
  summary: z
    .string()
    .describe("An overall summary of the market anomaly scan for the selected segment. Could include general observations or lack of significant anomalies."),
  lastScanned: z
    .string()
    .describe("Timestamp of when the simulated scan was performed (e.g., 'As of October 27, 2023 15:00 UTC')."),
  dataDisclaimer: z.string().default("Anomaly detection is AI-simulated based on general market patterns and not real-time, exhaustive data analysis. Interpret with caution.").describe("Disclaimer about the nature of the data.")
});
export type DetectMarketAnomaliesOutput = z.infer<typeof DetectMarketAnomaliesOutputSchema>;

export async function detectMarketAnomalies(input: DetectMarketAnomaliesInput): Promise<DetectMarketAnomaliesOutput> {
  return detectMarketAnomaliesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectMarketAnomaliesPrompt',
  input: {schema: DetectMarketAnomaliesInputSchema},
  output: {schema: DetectMarketAnomaliesOutputSchema},
  prompt: `You are an advanced AI market surveillance system tasked with detecting anomalies in the cryptocurrency market segment: "{{marketSegment}}".
Simulate a comprehensive scan considering factors like:
- Price volatility against typical behavior.
- Trading volume spikes or dips compared to averages.
- Sudden shifts in social media sentiment (e.g., rapid increase in negative mentions, unusual hype).
- Significant liquidity movements on exchanges or DEXs (conceptual).
- Emergence of security alerts or FUD (Fear, Uncertainty, Doubt).
- Unusual whale transaction patterns.

Your analysis should result in a list of detected anomalies. For each anomaly, provide:
- 'coinName': The name of the coin.
- 'symbol': The coin's ticker symbol.
- 'anomalyType': Classify the anomaly (e.g., "Unusual Price Movement", "High Trading Volume", "Social Sentiment Spike", "Liquidity Event", "Security Alert", "Whale Activity Spike").
- 'description': A concise yet detailed explanation of what was observed and why it's considered anomalous for the "{{marketSegment}}" segment.
- 'severity': "Critical", "High", "Medium", or "Low".
- 'timestamp': A simulated realistic timestamp for when the anomaly occurred or was noted (e.g., "15 minutes ago", "2023-10-26 08:00 UTC").
- 'confidence': Your confidence in this detection (0.0 to 1.0).

Also provide an overall 'summary' of your findings for the "{{marketSegment}}" (e.g., "Several meme coins show heightened volatility," or "Generally stable with minor sentiment shifts noted for two DeFi tokens.").
Set 'lastScanned' to a simulated current timestamp (e.g., "As of October 26, 2023 10:00 UTC").
Include the 'dataDisclaimer'.

If no significant anomalies are detected for the "{{marketSegment}}", the 'anomalies' array should be empty, and the 'summary' should reflect this (e.g., "No significant market anomalies detected in the Meme Coin segment during this scan.").
Focus on generating plausible and diverse anomalies typical for the specified market segment.
`,
});

const detectMarketAnomaliesFlow = ai.defineFlow(
  {
    name: 'detectMarketAnomaliesFlow',
    inputSchema: DetectMarketAnomaliesInputSchema,
    outputSchema: DetectMarketAnomaliesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output) {
        // Ensure lastScanned is set if LLM forgets
        if (!output.lastScanned) {
            output.lastScanned = `As of ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })} UTC`;
        }
         // Ensure disclaimer is present
        if (!output.dataDisclaimer) {
            output.dataDisclaimer = "Anomaly detection is AI-simulated based on general market patterns and not real-time, exhaustive data analysis. Interpret with caution.";
        }
    }
    return output!;
  }
);
