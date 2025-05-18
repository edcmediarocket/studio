
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
  subject: z.string().describe('The factor or aspect being rated for confidence (e.g., "Data Quality", "Model Stability", "Market Volatility Impact").'),
  score: z.number().min(0).max(100).int().describe('The confidence score for this subject (0-100).'),
  fullMark: z.literal(100).default(100).describe('The maximum possible score for this subject, always 100.'),
});

const ConfidenceTrendPointSchema = z.object({
  period: z.string().describe('Label for the time period (e.g., "Previous", "Recent", "Current", or "T-2", "T-1", "T0").'),
  confidence: z.number().min(0).max(100).int().describe('The overall confidence score for that period (0-100).'),
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
    .min(3) // Ensure at least 3 points for a radar chart
    .describe('Data points for a radar chart, breaking down confidence by various underlying factors. Aim for 5-7 factors.'),
  confidenceTrend: z
    .array(ConfidenceTrendPointSchema)
    .min(2) // Ensure at least 2 points for a trend
    .describe('A simplified series of confidence scores over a few simulated recent periods to indicate trend (e.g., 3-5 points like "Previous", "Recent", "Current").'),
  predictionDriftSummary: z
    .string()
    .describe('A textual summary describing how predictions of this type for this coin have been evolving or "drifting" recently (e.g., "Predictions have been trending more bullish", "Confidence has remained stable despite market fluctuations").'),
  keyFactorsInfluencingConfidence: z
    .array(z.string())
    .describe('A list of 3-5 key textual factors currently influencing the AI\'s confidence for this prediction (e.g., "High recent volatility in {{coinName}}", "Strong corroborating signals from on-chain data", "Limited historical data for this specific pattern").'),
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
  prompt: `You are an AI Prediction Confidence Analyst. For the coin "{{coinName}}" and prediction type "{{predictionType}}", provide a detailed analysis of the AI's confidence.

Your response must strictly follow the JSON output schema.

Key Generation Instructions:
1.  **overallConfidenceScore**: A single integer (0-100).
2.  **radarChartData**: Generate 5-7 distinct 'subject' factors that would contribute to prediction confidence (e.g., "Historical Accuracy", "Data Volume & Quality", "Model Stability", "Market Correlation", "Volatility Impact", "Recent Anomaly Detection"). Assign a 'score' (0-100) for each. 'fullMark' is always 100.
3.  **confidenceTrend**: Provide 3-5 data points representing a *simulated* trend in overall confidence for this type of prediction recently. Use period labels like "2 Weeks Ago", "1 Week Ago", "Current" or "Cycle N-2", "Cycle N-1", "Current Cycle".
4.  **predictionDriftSummary**: Describe how predictions of type "{{predictionType}}" for "{{coinName}}" have been changing or holding steady recently. For example, "AI price targets for {{coinName}} have shown a slight upward drift over the past 48 hours, suggesting increasing short-term bullishness." or "Signal confidence has remained consistently high, indicating stable model performance."
5.  **keyFactorsInfluencingConfidence**: List 3-5 specific, plausible factors that are currently impacting the AI's confidence for this {{predictionType}} regarding {{coinName}}. Examples: "Increased social media chatter volume for {{coinName}}", "Conflicting signals from short-term technical indicators", "Successful backtesting of this model on similar assets".
6.  **analysisTimestamp**: Set this to the current date and time in 'YYYY-MM-DD HH:MM UTC' format.
7.  **disclaimer**: Include the standard disclaimer.

Make the generated data sound plausible and insightful for an AI analyzing its own prediction confidence.
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
