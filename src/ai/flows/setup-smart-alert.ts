
'use server';
/**
 * @fileOverview An AI agent that helps users set up and analyze smart alerts.
 *
 * - setupSmartAlert - A function that processes user-defined alert parameters and provides AI insights.
 * - SetupSmartAlertInput - The input type for the setupSmartAlert function.
 * - SetupSmartAlertOutput - The return type for the setupSmartAlert function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MetricEnum = z.enum(["Price", "MarketCap", "Volume24hChangePercent", "SocialMentions"]);
export type Metric = z.infer<typeof MetricEnum>;

const ConditionEnum = z.enum(["exceeds", "dropsBelow", "increasesByPercent", "decreasesByPercent"]);
export type Condition = z.infer<typeof ConditionEnum>;

export const SetupSmartAlertInputSchema = z.object({
  coinName: z.string().describe('The name of the cryptocurrency for the alert (e.g., Dogecoin).'),
  metric: MetricEnum.describe('The metric to monitor (e.g., Price, MarketCap).'),
  condition: ConditionEnum.describe('The condition for the alert to trigger (e.g., exceeds, dropsBelow).'),
  targetValue: z.number().describe('The numerical value for the condition (e.g., 0.25 for price, 50 for percentage).'),
  timeframe: z.string().optional().describe('Optional timeframe for percentage changes (e.g., "1h", "24h", "7d"). Required if condition is "increasesByPercent" or "decreasesByPercent".'),
});
export type SetupSmartAlertInput = z.infer<typeof SetupSmartAlertInputSchema>;

export const SetupSmartAlertOutputSchema = z.object({
  alertConfirmation: z.string().describe('A human-readable confirmation of the alert that has been set up.'),
  scenarioAnalysis: z.string().describe("AI-generated insights about the alert's conditions, such as potential likelihood, historical context (simulated), or market implications if triggered."),
  setupTimestamp: z.string().describe('The timestamp when the alert setup was processed.'),
  disclaimer: z.string().default("This is a simulated alert setup and analysis. No real-time monitoring or notifications will be sent. Always DYOR.").describe("Standard disclaimer."),
});
export type SetupSmartAlertOutput = z.infer<typeof SetupSmartAlertOutputSchema>;

export async function setupSmartAlert(input: SetupSmartAlertInput): Promise<SetupSmartAlertOutput> {
  return setupSmartAlertFlow(input);
}

const prompt = ai.definePrompt({
  name: 'setupSmartAlertPrompt',
  input: {schema: SetupSmartAlertInputSchema},
  output: {schema: SetupSmartAlertOutputSchema},
  prompt: `You are an AI assistant helping a user set up a smart alert for a cryptocurrency.
The user wants to set the following alert:
- Coin: {{{coinName}}}
- Metric: {{{metric}}}
- Condition: {{{condition}}}
- Target Value: {{{targetValue}}}
{{#if timeframe}}
- Timeframe for change: {{{timeframe}}}
{{/if}}

1.  **Generate 'alertConfirmation'**: Create a clear, concise message confirming the alert setup. For example: "Alert set for {{coinName}}: Notify if {{metric}} {{condition}} {{targetValue}}{{#if timeframe}} within {{timeframe}}{{/if}}."

2.  **Generate 'scenarioAnalysis'**: Provide a brief (2-3 sentences) AI-driven insight into this alert scenario. Consider factors like:
    *   The general volatility or typical behavior of {{{coinName}}} (if known for meme coins).
    *   How significant is the 'targetValue' relative to common movements for this 'metric'?
    *   What kind of market events or catalysts might typically lead to such a condition being met? (e.g., major news, exchange listings, broader market shifts).
    *   Keep the analysis speculative and high-level. For example: "A {{{targetValue}}} target for {{{coinName}}}'s {{{metric}}} {{#if timeframe}}over {{timeframe}}{{/if}} suggests monitoring for significant market momentum. Such changes often correlate with major news or shifts in overall market sentiment for speculative assets."

3.  **'setupTimestamp'**: This will be set programmatically.
4.  **'disclaimer'**: Ensure the standard disclaimer is included.

Your goal is to provide a helpful confirmation and a brief, insightful (simulated) analysis of the alert's conditions.
`,
});

const setupSmartAlertFlow = ai.defineFlow(
  {
    name: 'setupSmartAlertFlow',
    inputSchema: SetupSmartAlertInputSchema,
    outputSchema: SetupSmartAlertOutputSchema,
  },
  async (input: SetupSmartAlertInput) => {
    const {output} = await prompt(input);
    if (output) {
      output.setupTimestamp = new Date().toISOString();
      if (!output.disclaimer) {
        output.disclaimer = "This is a simulated alert setup and analysis. No real-time monitoring or notifications will be sent. Always DYOR.";
      }
    }
    return output!;
  }
);
