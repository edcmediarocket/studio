
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
  timestamp: z.string().describe("Simulated timestamp of when the anomaly was detected or became significant (e.g., '2 hours ago', 'July 27, 2024 14:30 UTC', 'today 10:00 UTC')."),
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
    .describe("Timestamp of when the simulated scan was performed (e.g., 'As of July 27, 2024 15:00 UTC')."),
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
- Price volatility against typical behavior for this segment.
- Trading volume spikes or dips compared to historical averages for coins in this segment.
- Sudden shifts in social media sentiment (e.g., rapid increase in negative mentions, unusual hype, coordinated FUD).
- Significant conceptual liquidity movements on exchanges or DEXs (e.g., large order book imbalances, major pool drains).
- Emergence of credible security alerts or widespread FUD (Fear, Uncertainty, Doubt) impacting tokens in the segment.
- Unusual whale transaction patterns (e.g., large single transactions, rapid accumulation/distribution by large wallets).

Your analysis should result in a list of detected anomalies. For each anomaly, provide:
- 'coinName': The name of the coin.
- 'symbol': The coin's ticker symbol.
- 'anomalyType': Classify the anomaly (e.g., "Unusual Price Movement", "High Trading Volume", "Social Sentiment Spike", "Liquidity Event", "Security Alert", "Whale Activity Spike").
- 'description': A concise yet detailed explanation of what was observed and why it's considered anomalous for the "{{marketSegment}}" segment. Be specific about the observation (e.g., "Price jumped 30% in 1 hour on unusually low volume, deviating from segment trend" instead of just "Price moved").
- 'severity': "Critical", "High", "Medium", or "Low", based on potential impact.
- 'timestamp': A simulated realistic timestamp for when the anomaly occurred or was noted (e.g., "15 minutes ago", "today 08:00 UTC", "July 27, 2024 10:15 UTC"). Make these sound current.
- 'confidence': Your confidence in this detection (0.0 to 1.0).

Also provide an overall 'summary' of your findings for the "{{marketSegment}}" (e.g., "Several meme coins show heightened volatility and unusual social media activity," or "DeFi segment appears generally stable with minor liquidity shifts noted for two tokens.").
Set 'lastScanned' to a simulated current timestamp (e.g., "As of July 27, 2024 10:30 UTC"). Ensure this sounds like a very recent scan.
Include the 'dataDisclaimer'.

If no significant anomalies are detected for the "{{marketSegment}}", the 'anomalies' array should be empty, and the 'summary' should reflect this (e.g., "No significant market anomalies detected in the Meme Coin segment during this scan.").
Focus on generating plausible and diverse anomalies typical for the specified market segment. Make the anomalies sound distinct and based on the conceptual data inputs.
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
        // Ensure lastScanned is set if LLM forgets or provides an invalid one
        if (!output.lastScanned || new Date(output.lastScanned).getFullYear() < new Date().getFullYear() -1 ) { // Basic check for old dates
            output.lastScanned = `As of ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} UTC`;
        }
         // Ensure disclaimer is present
        if (!output.dataDisclaimer) {
            output.dataDisclaimer = "Anomaly detection is AI-simulated based on general market patterns and not real-time, exhaustive data analysis. Interpret with caution.";
        }
    }
    return output!;
  }
);

