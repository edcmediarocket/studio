
'use server';
/**
 * @fileOverview An AI agent that provides a customized trading signal based on user-defined timeframe and risk profile.
 *
 * - getCustomizedCoinTradingSignal - A function that provides the customized trading signal and analysis.
 * - GetCustomizedCoinTradingSignalInput - The input type.
 * - GetCustomizedCoinTradingSignalOutput - The return type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetCustomizedCoinTradingSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin (e.g., Dogecoin).'),
  currentPriceUSD: z.number().optional().describe('The current market price of the coin in USD. If provided, this price MUST be used as a reference for all analysis and target prices.'),
  timeframe: z.enum(['1H', '4H', '1D', '1W']).describe('The desired trading timeframe for the signal (1 Hour, 4 Hours, 1 Day, 1 Week).'),
  riskProfile: z.enum(['Low', 'Medium', 'High']).describe('The user\'s desired risk profile (Low, Medium, High).'),
  tradingStyle: z.enum(['Scalping', 'Swing Trading', 'Position Holding']).optional().describe('The user\'s preferred trading style (e.g., Scalping, Swing Trading, Position Holding).'),
});
export type GetCustomizedCoinTradingSignalInput = z.infer<typeof GetCustomizedCoinTradingSignalInputSchema>;

const GetCustomizedCoinTradingSignalOutputSchema = z.object({
  outputCoinName: z.string().describe("The name of the coin for which the signal is generated."),
  outputCoinSymbol: z.string().describe("The ticker symbol of the coin (e.g., DOGE, SHIB)."),
  outputTimeframe: z.string().describe("The timeframe used for this signal generation (e.g., 1H, 4H, 1D, 1W)."),
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The trading recommendation: Buy, Sell, or Hold, tailored to the inputs.'),
  confidenceScore: z.number().min(0).max(100).int().describe('A numerical confidence score (0-100) for the generated signal. Higher means more confident.'),
  detailedAnalysis: z.string().describe('Rationale: In-depth analysis supporting the signal. Explain the logic with simulated technical indicators (RSI, MACD, Bollinger Bands, Volume, Moving Averages), recent whale behavior, and sentiment insights. This should incorporate how the user\'s risk profile, trading style, and selected timeframe influenced the decision. If currentPriceUSD was provided, this analysis MUST reference it.'),
  priceTargets: z.object({
    entryPoint: z.string().optional().describe('Suggested entry price range (e.g., "$0.040-$0.042") if applicable, adjusted for risk/timeframe. MUST be relative to currentPriceUSD if provided.'),
    stopLoss: z.string().describe('Crucial stop-loss price to limit potential losses, adjusted for risk/timeframe. MUST be relative to currentPriceUSD if provided.'),
    takeProfit1: z.string().describe('First take-profit target, adjusted for risk/timeframe. MUST be relative to currentPriceUSD if provided.'),
    takeProfit2: z.string().optional().describe('Second take-profit target, adjusted for risk/timeframe. MUST be relative to currentPriceUSD if provided.'),
  }).describe('Specific trading price targets, adjusted for the selected timeframe and risk profile. These MUST be scaled realistically based on currentPriceUSD if provided.'),
  strategyNotes: z.string().describe('Specific notes or advice on how to approach trading this signal, considering the user\'s timeframe, risk tolerance, and trading style (e.g., "For a high-risk, 1H scalping style, consider quick entries/exits based on observed volume spike." or "For a low-risk, 1W position holding style, look for broader trend confirmations using EMA crosses.").'),
  assessedRiskLevel: z.enum(['Low', 'Medium', 'High']).describe("The AI's assessment of the risk level for this specific trading signal, considering all factors."),
  disclaimer: z.string().default("This AI-generated trading signal is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.").describe("Standard disclaimer.")
});
export type GetCustomizedCoinTradingSignalOutput = z.infer<typeof GetCustomizedCoinTradingSignalOutputSchema>;

export async function getCustomizedCoinTradingSignal(input: GetCustomizedCoinTradingSignalInput): Promise<GetCustomizedCoinTradingSignalOutput> {
  // Basic symbol inference (can be expanded)
  let symbol = input.coinName.toUpperCase();
  if (input.coinName.toLowerCase() === "dogecoin") symbol = "DOGE";
  if (input.coinName.toLowerCase() === "shiba inu") symbol = "SHIB";
  if (input.coinName.toLowerCase() === "pepe") symbol = "PEPE";
  if (input.coinName.toLowerCase() === "bonk") symbol = "BONK";


  const result = await getCustomizedCoinTradingSignalFlow(input);
  // Ensure outputCoinName and outputCoinSymbol are set based on input, and outputTimeframe matches input.
  if (result) {
    result.outputCoinName = input.coinName;
    result.outputCoinSymbol = symbol; // Use inferred or capitalized symbol
    result.outputTimeframe = input.timeframe;
  }
  return result;
}

const prompt = ai.definePrompt({
  name: 'getCustomizedCoinTradingSignalPrompt',
  input: {schema: GetCustomizedCoinTradingSignalInputSchema},
  output: {schema: GetCustomizedCoinTradingSignalOutputSchema},
  prompt: `You are a top-tier crypto trading signal generator powered by real-time market analysis, trained on historical trends, on-chain analytics, whale movements, and social sentiment.
Your task is to generate a smart, precise, and **customized trading signal** for the meme coin "{{coinName}}" based on user-defined parameters and simulated live data analysis.

### User Profile & Request:
- Coin Name: {{coinName}}
{{#if currentPriceUSD}}
- Current Market Price of {{coinName}}: {{{currentPriceUSD}}} USD. This price is CRITICAL context for your analysis and all price targets.
{{else}}
- No specific current market price was provided for {{coinName}}. Your analysis will be more general but still strive for plausible targets.
{{/if}}
- Desired Timeframe: {{timeframe}}
- User's Risk Tolerance: {{riskProfile}}
{{#if tradingStyle}}
- User's Trading Style: {{tradingStyle}}
{{else}}
- User's Trading Style: Not specified (assume a balanced approach or infer if possible).
{{/if}}

### Simulated Real-Time Market Data Analysis:
For "{{coinName}}", you must ACT AS IF you have analyzed the following (even if you have to simulate plausible scenarios based on general knowledge of meme coins and the user's parameters):
- Technical Indicators: RSI levels (overbought/oversold), MACD crossovers, Bollinger Band squeezes/expansions, significant Volume spikes, Moving Average trends (e.g., EMA20, EMA50, EMA200) for the specified {{timeframe}}.
- On-Chain Metrics: Simulated insights into token flow (exchange inflows/outflows), new vs. active wallet trends, significant contract interactions if applicable.
- Whale Activity: Simulated large transactions, accumulation/distribution patterns by significant holders.
- Social Sentiment: Simulated prevailing sentiment from Twitter/X, Reddit, Telegram (positive, negative, neutral, hype levels, FUD).
- Recent News & Developments: Any major (simulated) news, partnerships, or roadmap updates relevant to {{coinName}}.

### Output Instructions:
Your response MUST strictly adhere to the JSON output schema.
- 'outputCoinName': Must be "{{coinName}}".
- 'outputCoinSymbol': Provide a common ticker symbol for "{{coinName}}" (e.g., DOGE for Dogecoin, SHIB for Shiba Inu). If unsure, use the capitalized coin name.
- 'outputTimeframe': Must be "{{timeframe}}".
- 'recommendation': Clearly state "Buy", "Sell", or "Hold".
- 'confidenceScore': Integer from 0-100 reflecting your certainty.
- 'detailedAnalysis' (Rationale): This is crucial. Explain your logic by integrating insights from your simulated analysis of Technical Indicators, On-Chain Metrics, Whale Activity, and Social Sentiment. Explicitly state how the user's {{riskProfile}}, {{tradingStyle}}, and {{timeframe}} influenced your recommendation. For example, a "High" risk profile might lead to accepting signals with lower traditional confirmation but higher volatility, while a "Low" risk profile for a "1W" timeframe would look for very strong, confirmed trends. {{#if currentPriceUSD}}Your analysis MUST incorporate the current price of {{{currentPriceUSD}}} USD.{{/if}}
- 'priceTargets':
    {{#if currentPriceUSD}}
    CRITICAL: All price targets ('entryPoint', 'stopLoss', 'takeProfit1', 'takeProfit2') MUST be numerically plausible and scaled relative to the provided current market price of {{{currentPriceUSD}}} USD. These targets should reflect the specified {{timeframe}} and {{riskProfile}}. For example, if current price is $2.50, targets should be in a similar range (e.g., entry $2.45, SL $2.30, TP1 $2.70), not $0.000x or $5000 unless an extreme, well-justified event is described in the analysis.
    {{else}}
    Provide plausible price targets. If no current price is available, make general estimations (e.g., "Entry around current levels", "Target +10%", "Stop-loss -5% from entry").
    {{/if}}
- 'strategyNotes': Offer actionable advice on how to approach this signal, considering the user's {{riskProfile}}, {{tradingStyle}}, and {{timeframe}}.
- 'assessedRiskLevel': Your AI's assessment ("Low", "Medium", "High") of the risk associated with *this specific trading signal and setup*, considering all factors. This might differ from the user's input risk profile if the market conditions for the coin are particularly volatile or stable.
- 'disclaimer': Include the standard disclaimer.

Be concise in output fields but thorough in 'detailedAnalysis'. Only generate signals when your simulated data provides a high-conviction basis for action, appropriate for the user's inputs. If data is too scarce or conditions too uncertain for "{{coinName}}" on the {{timeframe}}, you may lean towards "Hold" with a lower confidence score and explain why in the analysis.
`,
});

const getCustomizedCoinTradingSignalFlow = ai.defineFlow(
  {
    name: 'getCustomizedCoinTradingSignalFlow',
    inputSchema: GetCustomizedCoinTradingSignalInputSchema,
    outputSchema: GetCustomizedCoinTradingSignalOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This AI-generated trading signal is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.";
    }
    // Ensure essential output fields are populated even if LLM misses them structurally
    if (output) {
        output.outputCoinName = input.coinName;
        output.outputTimeframe = input.timeframe;
        if (!output.outputCoinSymbol) {
             let symbol = input.coinName.toUpperCase();
             if (input.coinName.toLowerCase() === "dogecoin") symbol = "DOGE";
             if (input.coinName.toLowerCase() === "shiba inu") symbol = "SHIB";
             if (input.coinName.toLowerCase() === "pepe") symbol = "PEPE";
             if (input.coinName.toLowerCase() === "bonk") symbol = "BONK";
             output.outputCoinSymbol = symbol;
        }
    }
    return output!;
  }
);

    