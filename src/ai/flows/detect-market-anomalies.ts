
'use server';
/**
 * @fileOverview An AI agent that detects and reports market anomalies for a given crypto segment, including volume surges.
 *
 * - detectMarketAnomalies - A function that scans for market anomalies.
 * - DetectMarketAnomaliesInput - The input type for the detectMarketAnomalies function.
 * - DetectMarketAnomaliesOutput - The return type for the detectMarketAnomalies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectMarketAnomaliesInputSchema = z.object({
  marketSegment: z.string().describe('The market segment to scan for anomalies (e.g., "Meme Coins", "Top 100 Crypto", "DeFi Tokens", "Low Cap Gems").'),
});
export type DetectMarketAnomaliesInput = z.infer<typeof DetectMarketAnomaliesInputSchema>;

const AnomalySchema = z.object({
  coinName: z.string().describe("The name of the coin exhibiting the anomaly."),
  symbol: z.string().describe("The ticker symbol of the coin."),
  anomalyType: z.enum(["Unusual Price Movement", "High Trading Volume", "Social Sentiment Spike", "Liquidity Event", "Security Alert", "Whale Activity Spike"]).describe("The type of anomaly detected."),
  description: z.string().describe("A detailed description of the detected anomaly and its potential implications. For 'High Trading Volume', if it's a surge, specify the percentage if known."),
  severity: z.enum(["Critical", "High", "Medium", "Low"]).describe("The assessed severity of the anomaly."),
  timestamp: z.string().describe("Simulated timestamp of when the anomaly was detected or became significant. Prioritize relative times like '2 hours ago', 'today 10:00 UTC' over specific past dates."),
  confidence: z.number().min(0).max(1).describe("AI's confidence in this anomaly detection (0.0 to 1.0)."),
  volumeChangePercentage: z.number().optional().describe("For 'High Trading Volume' anomalies, the simulated percentage increase in volume compared to a recent average (e.g., 325 for 325%).")
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
    .describe("Timestamp of when the simulated scan was performed. This will be set to the current time."),
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
- Trading volume spikes or dips compared to historical averages for coins in this segment. **If you detect a significant volume spike for a coin (especially a low-market-cap one), classify it as "High Trading Volume" and estimate the 'volumeChangePercentage' (e.g., if volume is 3x the average, 'volumeChangePercentage' could be 200). The 'description' for this should clearly state the volume surge.**
- Sudden shifts in social media sentiment.
- Significant conceptual liquidity movements.
- Emergence of credible security alerts or FUD.
- Unusual whale transaction patterns.

Your analysis should result in a list of detected anomalies. For each anomaly, provide:
- 'coinName', 'symbol'.
- 'anomalyType': Classify the anomaly. Use "High Trading Volume" for significant volume surges.
- 'description': A concise yet detailed explanation. For volume surges, include the percentage increase. For example: "Volume Spike Detected: $COIN_SYMBOL volume surged approximately {{volumeChangePercentage}}% compared to its 24hr average, indicating sudden high interest."
- 'severity': Based on potential impact.
- 'timestamp': Prioritize relative times like 'X minutes ago', 'Y hours ago', or specific times from 'today'.
- 'confidence': Your confidence (0.0 to 1.0).
- 'volumeChangePercentage': If 'anomalyType' is "High Trading Volume" due to a surge, provide this numeric value (e.g., 325 for 325%).

Also provide an overall 'summary'. The 'lastScanned' field will be automatically set. Include 'dataDisclaimer'.
If no significant anomalies, 'anomalies' array should be empty.
Focus on plausible, diverse anomalies. For volume surges, a separate 'volumeChangePercentage' field should be populated if the anomaly is a volume spike.
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
        // Programmatically set lastScanned to the current date and time
        output.lastScanned = `As of ${new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit', 
            timeZoneName: 'short' 
        })}`;
        
        // Ensure disclaimer is present
        if (!output.dataDisclaimer) {
            output.dataDisclaimer = "Anomaly detection is AI-simulated based on general market patterns and not real-time, exhaustive data analysis. Interpret with caution.";
        }
    }
    return output!;
  }
);

