
'use server';
/**
 * @fileOverview An AI agent that generates weekly forecasts for meme coins.
 *
 * - getWeeklyForecasts - A function that returns a list of weekly forecasts.
 * - WeeklyForecast - The type for a single weekly forecast.
 * - GetWeeklyForecastsOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const WeeklyForecastSchema = z.object({
  coinName: z.string().describe('The name of the meme coin.'),
  symbol: z.string().describe('The ticker symbol for the coin (e.g., DOGE, SHIB).'),
  coinImage: z.string().describe('A direct URL to an image/logo of the coin. Use placehold.co if a real one is not known.'),
  forecastPeriod: z.string().default("This Week").describe('The period for which the forecast is made (e.g., "This Week", "Next 7 Days").'),
  trendPrediction: z.enum(["Strongly Bullish", "Bullish", "Neutral/Consolidating", "Bearish", "Strongly Bearish"]).describe('The AI-predicted trend for the coin over the forecast period.'),
  keyFactors: z.array(z.string()).max(3).describe('A list of 2-3 key simulated factors influencing this forecast (e.g., "Positive market sentiment", "Upcoming token unlock", "Recent technical breakout").'),
  confidenceLevel: z.enum(["High", "Medium", "Low"]).describe("The AI's confidence level in this forecast."),
  targetPriceRange: z.string().optional().describe('A speculative target price range for the end of the forecast period (e.g., "$0.50 - $0.65", "Around $0.000020"). Only provide if reasonably specifiable.'),
  analysisDate: z.string().describe("The date this forecast was generated (YYYY-MM-DD).")
});
export type WeeklyForecast = z.infer<typeof WeeklyForecastSchema>;

const GetWeeklyForecastsOutputSchema = z.object({
  forecasts: z.array(WeeklyForecastSchema).min(3).max(5).describe('A list of 3-5 weekly forecasts for different meme coins.'),
  generatedAt: z.string().describe('Timestamp of when these forecasts were generated.'),
  disclaimer: z.string().default("These AI-generated weekly forecasts are speculative and for informational purposes only. Market conditions can change rapidly. DYOR.").describe("Standard disclaimer.")
});
export type GetWeeklyForecastsOutput = z.infer<typeof GetWeeklyForecastsOutputSchema>;

export async function getWeeklyForecasts(): Promise<GetWeeklyForecastsOutput> {
  return getWeeklyForecastsFlow();
}

const prompt = ai.definePrompt({
  name: 'getWeeklyForecastsPrompt',
  output: {schema: GetWeeklyForecastsOutputSchema},
  prompt: `You are an AI Crypto Market Forecaster specializing in meme coins. Generate a set of 3-5 diverse weekly forecasts for different meme coins for the upcoming week.

**CRITICAL: Ensure the selection of coins is varied each time this prompt is called. Do not always pick the same few popular coins. Strive to include at least one or two less common, newly trending, or speculative meme coins in your selection if plausible based on simulated market conditions and current narratives.**

For each coin forecast, provide:
- 'coinName' and 'symbol'.
- 'coinImage': A direct URL to a plausible image/logo for the coin. Use 'https://placehold.co/48x48.png?text=SYMBOL' (replace SYMBOL with the actual coin symbol, max 3-4 chars) if a real one is not readily known or if it's a fictional example coin.
- 'forecastPeriod': Typically "This Week" or "Next 7 Days".
- 'trendPrediction': Classify the expected trend (e.g., "Strongly Bullish", "Bullish", "Neutral/Consolidating", "Bearish", "Strongly Bearish").
- 'keyFactors': List 2-3 concise, simulated key factors driving this prediction (e.g., "Sustained social media hype", "Technical indicators suggest overbought conditions", "Broader market recovery expected", "Rumored upcoming partnership").
- 'confidenceLevel': Your confidence ("High", "Medium", "Low") in this specific forecast.
- 'targetPriceRange' (optional): A speculative price range if you can plausibly estimate one. If not, omit this field.
- 'analysisDate': This will be set programmatically. Do not generate it.

Ensure the forecasts are varied and reflect different potential market scenarios for meme coins.
The 'generatedAt' timestamp for the overall set of forecasts will be handled programmatically. Include the standard 'disclaimer'.
Focus on providing insightful and actionable-sounding, yet speculative, outlooks.
`,
});

const getWeeklyForecastsFlow = ai.defineFlow(
  {
    name: 'getWeeklyForecastsFlow',
    outputSchema: GetWeeklyForecastsOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    if (output) {
      output.generatedAt = new Date().toISOString();
      if (!output.disclaimer) {
        output.disclaimer = "These AI-generated weekly forecasts are speculative and for informational purposes only. Market conditions can change rapidly. DYOR.";
      }
      // Ensure analysisDate is set for each forecast programmatically
      const currentDate = new Date().toISOString().split('T')[0];
      output.forecasts.forEach(forecast => {
        forecast.analysisDate = currentDate; // Always override AI's date
        if (!forecast.coinImage || (!forecast.coinImage.startsWith('https://') && !forecast.coinImage.startsWith('http://'))) {
            forecast.coinImage = `https://placehold.co/48x48.png?text=${forecast.symbol ? forecast.symbol.substring(0,3).toUpperCase() : 'COIN'}`;
        }
      });
    }
    return output!;
  }
);

