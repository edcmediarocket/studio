
'use server';
/**
 * @fileOverview Provides AI-generated insights into the confidence of predictions for a specific coin and prediction type.
 *
 * - getPredictionConfidenceInsights - A function that returns confidence analysis.
 * - GetPredictionConfidenceInsightsInput - The input type.
 * - GetPredictionConfidenceInsightsOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetPredictionConfidenceInsightsInputSchema = z.object({
  coinName: z.string().describe('The name of the coin for which confidence insights are being generated (e.g., Dogecoin).'),
  predictionType: z.string().describe('The type of prediction being analyzed (e.g., "7-day Price Trend", "Next Major Move Signal", "ROI Prediction").'),
});
export type GetPredictionConfidenceInsightsInput = z.infer<typeof GetPredictionConfidenceInsightsInputSchema>;

const RadarSubjectSchema = z.object({
  subject: z.string().describe('The factor or aspect being rated for confidence (e.g., "Historical Accuracy", "Data Volume & Quality", "Market Volatility Impact", "Recent Anomaly Detection", "Corroboration with Other Indicators").'),
  score: z.number().min(0).max(100).int().describe('The confidence score for this subject (0-100).'),
  fullMark: z.number().describe('The maximum possible score for this subject. This value should be 100.'),
});

const ConfidenceTrendPointSchema = z.object({
  period: z.string().describe('Label for the time period (e.g., "Previous Cycle", "Recent Cycle", "Current Cycle", or "T-2", "T-1", "T0").'),
  confidence: z.number().min(0).max(100).int().describe('The overall confidence score for that period (0-100).'),
  interpretation: z.string().optional().describe("A brief interpretation of the confidence for this period, e.g., 'Increased due to market stabilization.'"),
});

const GetPredictionConfidenceInsightsOutputSchema = z.object({
  coinName: z.string().describe('The name of the coin analyzed.'),
  predictionType: z.string().describe('The type of prediction analyzed.'),
  overallConfidenceScore: z
    .number()
    .min(0)
    .max(100)
    .int()
    .describe('A single numerical score representing the AI\'s overall confidence in this type of prediction for this coin (0-100).'),
  radarChartData: z
    .array(RadarSubjectSchema)
    .min(3) 
    .max(7)
    .describe('Data points for a radar chart, breaking down confidence by various underlying factors. Aim for 5-7 diverse factors like "Historical Accuracy", "Data Freshness", "Market Correlation", "Volatility Impact", "Model Stability".'),
  confidenceTrend: z
    .array(ConfidenceTrendPointSchema)
    .min(2)
    .max(5)
    .describe('A simplified series of confidence scores over a few simulated recent periods to indicate trend (e.g., 3-5 points like "Previous Cycle", "Recent Cycle", "Current Cycle"). Include a brief interpretation for each point if possible.'),
  predictionDriftSummary: z
    .string()
    .describe('A textual summary describing how predictions of this type for this coin have been evolving or "drifting" recently, e.g., "Predictions have shown a slight bullish drift over the past 24 hours, with target prices increasing by an average of 2%." or "Signal confidence has remained stable despite minor market fluctuations, suggesting robustness."'),
  keyFactorsInfluencingConfidence: z
    .array(z.string())
    .max(5)
    .describe('A list of 3-5 key textual factors currently influencing the AI\'s confidence for this prediction (e.g., "High recent volatility in {{coinName}}", "Strong corroborating signals from on-chain data", "Limited historical data for this specific pattern", "Recent major news event impacting market").'),
  modelHealthSummary: z.string().optional().describe("Brief assessment of simulated model health, e.g., 'Model performing within expected parameters, recent retraining successful.' or 'Input data stream for social sentiment showing higher than usual noise.'"),
  sensitivityToInputs: z.string().optional().describe("Summary of how sensitive this prediction type is to variations in its key inputs, e.g., 'Price predictions highly sensitive to sudden whale movements; less so to general social chatter volume.'"),
  analysisTimestamp: z.string().describe('The timestamp when this confidence analysis was generated (YYYY-MM-DD HH:MM UTC).'),
  disclaimer: z
    .string()
    .default('This confidence analysis is AI-generated and for informational purposes. It reflects the model\'s simulated certainty, not a guarantee of future outcomes. DYOR.')
    .describe('Standard disclaimer.'),
});
export type GetPredictionConfidenceInsightsOutput = z.infer<typeof GetPredictionConfidenceInsightsOutputSchema>;

export async function getPredictionConfidenceInsights(input: GetPredictionConfidenceInsightsInput): Promise<GetPredictionConfidenceInsightsOutput> {
  return getPredictionConfidenceInsightsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getPredictionConfidenceInsightsPrompt',
  input: {schema: GetPredictionConfidenceInsightsInputSchema},
  output: {schema: GetPredictionConfidenceInsightsOutputSchema},
  prompt: `You are an AI Prediction Confidence Analyst. For the coin "{{coinName}}" and prediction type "{{predictionType}}", provide a detailed and advanced analysis of the AI's confidence.

Your response must strictly follow the JSON output schema.

Key Generation Instructions:
1.  **overallConfidenceScore**: A single integer (0-100).
2.  **radarChartData**: Generate 5-7 distinct 'subject' factors that contribute to prediction confidence. Use analytical and insightful subjects such as "Historical Backtest Accuracy", "Input Data Freshness & Quality", "Model Stability & Recency", "Market Correlation Analysis", "Volatility Impact Assessment", "Anomaly Detection Rate (Recent)", "Corroboration with Other Technical/Fundamental Indicators". Assign a 'score' (0-100) for each. 'fullMark' is always 100.
3.  **confidenceTrend**: Provide 3-5 data points representing a *simulated* trend in overall confidence for this type of prediction recently. Use period labels like "2 Weeks Ago", "1 Week Ago", "Current" or "Cycle N-2", "Cycle N-1", "Current Cycle". For each point, include a brief 'interpretation' of why the confidence might be at that level for that period.
4.  **predictionDriftSummary**: Describe in detail how predictions of type "{{predictionType}}" for "{{coinName}}" have been changing or holding steady recently. Be specific if possible, e.g., "AI price targets for {{coinName}} have shown a slight upward drift of approximately 1.5% over the past 48 hours, suggesting increasing short-term bullishness, mainly driven by improving sentiment metrics." or "Signal confidence has remained consistently high around 85-90%, indicating stable model performance even with recent minor market corrections."
5.  **keyFactorsInfluencingConfidence**: List 3-5 specific, plausible factors that are currently impacting the AI's confidence for this {{predictionType}} regarding {{coinName}}. Examples: "Increased social media chatter volume and velocity for {{coinName}}", "Conflicting signals between short-term (1H) and mid-term (4H) technical indicators", "Successful backtesting of this prediction model on assets with similar volatility profiles", "A recent unexpected partnership announcement for {{coinName}}.", "Lack of significant trading volume to confirm recent price movements."
6.  **modelHealthSummary (Optional but Encouraged)**: Provide a brief assessment of the simulated underlying AI model's health. Consider aspects like data input quality, recent (simulated) retraining performance, or any detected data anomalies. E.g., "Model performing within expected parameters; recent data ingestion for {{coinName}} is clean." or "Social sentiment data stream for {{coinName}} currently showing high noise, potentially impacting short-term sentiment accuracy."
7.  **sensitivityToInputs (Optional but Encouraged)**: Summarize how sensitive this particular "{{predictionType}}" is to changes in its key input factors for {{coinName}}. E.g., "Short-term price predictions for {{coinName}} are highly sensitive to sudden whale transaction alerts and major exchange listing news; moderately sensitive to broad market BTC movements."
8.  **analysisTimestamp**: Set this to the current date and time in 'YYYY-MM-DD HH:MM UTC' format.
9.  **disclaimer**: Include the standard disclaimer.

Make the generated data sound plausible, detailed, and insightful for an AI analyzing its own prediction confidence.
`,
});

const getPredictionConfidenceInsightsFlow = ai.defineFlow(
  {
    name: 'getPredictionConfidenceInsightsFlow',
    inputSchema: GetPredictionConfidenceInsightsInputSchema,
    outputSchema: GetPredictionConfidenceInsightsOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output) {
      // Ensure timestamp is current if AI fails to generate it
      if (!output.analysisTimestamp || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC$/.test(output.analysisTimestamp) ) {
         const now = new Date();
         output.analysisTimestamp = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} UTC`;
      }
      if (!output.disclaimer) {
        output.disclaimer = 'This confidence analysis is AI-generated and for informational purposes. It reflects the model\'s simulated certainty, not a guarantee of future outcomes. DYOR.';
      }
      output.coinName = input.coinName;
      output.predictionType = input.predictionType;
    }
    return output!;
  }
);

    
