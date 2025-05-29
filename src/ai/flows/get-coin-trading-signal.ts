
'use server';
/**
 * @fileOverview An AI agent that provides a trading signal (buy/sell/hold), detailed analysis, price targets, and investment advice for a specific meme coin, considering its current price and user's trading style.
 *
 * - getCoinTradingSignal - A function that provides the trading signal and analysis.
 * - GetCoinTradingSignalInput - The input type.
 * - GetCoinTradingSignalOutput - The return type.
 */

import {ai}from '@/ai/genkit';
import {z} from 'genkit';

const TradingStyleEnum = z.enum([
  "Conservative", 
  "Swing Trader", 
  "Scalper", 
  "High-Risk/High-Reward", 
  "AI Hybrid"
]).describe("The user's selected trading style to tailor the advice.");

const GetCoinTradingSignalInputSchema = z.object({
  coinName: z.string().describe('The name of the meme coin to get a trading signal for (e.g., Dogecoin).'),
  currentPriceUSD: z.number().optional().describe('The current market price of the coin in USD. If provided, this price MUST be used as a reference for all analysis and target prices.'),
  tradingStyle: TradingStyleEnum.optional().describe("The user's preferred trading style. Tailor advice accordingly."),
});
export type GetCoinTradingSignalInput = z.infer<typeof GetCoinTradingSignalInputSchema>;

const GetCoinTradingSignalOutputSchema = z.object({
  recommendation: z.enum(['Buy', 'Sell', 'Hold']).describe('The trading recommendation: Buy, Sell, or Hold.'),
  reasoning: z.string().describe('A concise summary of the main reason for the recommendation.'),
  confidenceScore: z.number().min(0).max(100).int().describe('A numerical confidence score (0-100) for the generated signal. Higher means more confident.'),
  keyReasoningFactors: z.array(z.object({
    factor: z.string().describe("The contributing factor, e.g., RSI, MACD, Social Sentiment, Whale Activity, Developer Activity, AI Forecast Agreement."),
    value: z.string().describe("The observed value or state of the factor, e.g., '68', 'Bullish Crossover', '73% Positive', '$3.2M Inflow', 'High'."),
    impact: z.enum(["Positive", "Negative", "Neutral"]).describe("The perceived impact of this factor on the signal (Positive, Negative, or Neutral towards the recommendation).")
  })).optional().describe("A breakdown of 3-5 key factors and their impact influencing the trading signal."),
  detailedAnalysis: z.string().describe('In-depth analysis of the factors influencing the signal. This should be a comprehensive summary reflecting analysis of market sentiment, technical indicators (including RSI, MACD, EMA trends, price breakouts, volume spikes), on-chain data, whale activity, and tokenomics, as if derived from a sophisticated AI model trained on extensive crypto datasets. If currentPriceUSD was provided, this analysis MUST reference it. This analysis should also reflect the chosen tradingStyle if provided.'),
  futurePriceOutlook: z.object({
    shortTermTarget: z.string().optional().describe('Speculative short-term price target string (e.g., "$0.05 in 1 week", "0.1234 USD"). This MUST be a plausible value derived directly from currentPriceUSD if provided. Include indicative predictions for timeframes like 1h, 6h, or 24h if possible. Adjust aggressiveness based on tradingStyle.'),
    midTermTarget: z.string().optional().describe('Speculative mid-term price target string (e.g., "$0.10 in 1-3 months", "1.50 USD"). This MUST be a plausible value derived directly from currentPriceUSD if provided. Include an indicative prediction for a timeframe like 7d if possible. Adjust aggressiveness based on tradingStyle.'),
    longTermTarget: z.string().optional().describe('Speculative long-term price target string (e.g., "$0.25 in 6-12 months", "Potential for $1.00+ if milestones met"). This MUST be a plausible value derived directly from currentPriceUSD if provided. Adjust based on tradingStyle and coin potential.'),
  }).describe('Speculative future price targets based on current analysis. If currentPriceUSD was provided, these targets MUST be scaled realistically from that price and influenced by the tradingStyle.'),
  tradingTargets: z.object({
    entryPoint: z.string().optional().describe('Suggested entry price range string (e.g., "$0.040-$0.042", "0.038 USD"), if applicable for a "Buy" signal. MUST be a plausible value derived directly from currentPriceUSD if provided and tailored to the tradingStyle.'),
    stopLoss: z.string().describe('Suggested stop-loss price string to limit potential losses (e.g., "$0.035", "0.030 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, or relative to entry point, and tailored to the tradingStyle (e.g., tighter for Scalper, wider for Conservative).'),
    takeProfit1: z.string().describe('First take-profit target price string (e.g., "$0.055", "0.060 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, or relative to entry point, and tailored to the tradingStyle.'),
    takeProfit2: z.string().optional().describe('Second take-profit target price string (e.g., "$0.065", "0.070 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, and tailored to the tradingStyle.'),
    takeProfit3: z.string().optional().describe('Third take-profit target price string (e.g., "$0.075", "0.080 USD"). MUST be a plausible value derived directly from currentPriceUSD if provided, and tailored to the tradingStyle.')
  }).describe('Specific trading price targets. These MUST be scaled realistically based on currentPriceUSD if provided and heavily influenced by the selected tradingStyle. Format these price strings normally: for prices $0.01 or greater, use two decimal places (e.g., "$0.25", "$1.45"). For prices less than $0.01, use more appropriate precision (e.g., "$0.0012", "$0.000045").'),
  investmentAdvice: z.string().describe('Provide advanced and detailed investment advice or strategy for this coin based on the current signal, analysis, and the user\'s selected tradingStyle. This should include: \n1. Suggested portfolio allocation (e.g., "For a High-Risk/High-Reward style, consider this a 5-10% speculative play..." or "For a Conservative style, this might represent a 1-2% allocation..."). \n2. Specific entry/exit strategy nuances tailored to the tradingStyle (e.g., "Scalpers might look for quick 1-2% gains with tight stops." or "Conservative investors could DCA around the entry point and aim for mid-term targets."). \n3. Key risk management techniques relevant to the signal and tradingStyle (e.g., "High-Risk traders must use firm stop-losses. Conservative traders might avoid this signal if broader market is bearish."). \n4. Conditions that might invalidate the current signal or warrant a re-evaluation, considering the tradingStyle. \n5. If "Hold", specify key metrics to monitor for a change in outlook based on the tradingStyle.'),
  eventBasedTriggers: z.array(z.object({
    eventName: z.string().describe("The specific event or condition to monitor (e.g., 'BTC Dominance Change', 'Significant Whale Wallet Activity', 'CPI Data Release Effect', 'Major Exchange Listing News', 'Regulatory News Impact')."),
    triggerCondition: z.string().describe("The specific condition related to the event that would trigger a strategic adjustment (e.g., 'BTC dominance drops by 2%', 'net outflows from top 10 whale wallets exceed $1M in 6 hours', 'sentiment flips decidedly bullish post-CPI data and holds for 4 hours', 'coin lists on a Tier-1 exchange like Binance/Coinbase', 'negative regulatory announcement directly impacting meme coins')."),
    recommendedAction: z.string().describe("The suggested strategic adjustment or trading action if the trigger condition is met (e.g., 'Consider scaling into a Buy position', 'Prepare to Sell/Take Profit', 'Re-evaluate current Hold position', 'Potential short-term Buy opportunity, monitor closely', 'Temporarily de-risk position and observe')."),
    rationale: z.string().optional().describe("Brief reasoning for this event-based trigger strategy and its relevance to the selected trading style.")
  })).optional().describe("A list of 1-3 event-based triggers or conditional trading strategies based on potential market catalysts or changes, tailored to the selected trading style."),
  tradingSessionInsights: z.string().optional().describe("AI-generated insights on how current or upcoming global trading sessions (e.g., U.S. open, Asian session, European session) might influence the trading strategy for this coin, including potential timing considerations for entries or exits based on session-specific liquidity and volatility patterns. This should be tailored to the user's selected tradingStyle."),
  disclaimer: z.string().default("This AI-generated trading signal and analysis is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.").describe("Standard disclaimer.")
});
export type GetCoinTradingSignalOutput = z.infer<typeof GetCoinTradingSignalOutputSchema>;

export async function getCoinTradingSignal(input: GetCoinTradingSignalInput): Promise<GetCoinTradingSignalOutput> {
  return getCoinTradingSignalFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getCoinTradingSignalPrompt',
  input: {schema: GetCoinTradingSignalInputSchema},
  output: {schema: GetCoinTradingSignalOutputSchema},
  prompt: `You are "Meme Prophet", a highly advanced AI model trained to identify high-potential meme coins and altcoins. Your analysis is based on simulating real-time market data, on-chain activity, social sentiment, and whale transactions.
For the meme coin "{{coinName}}"{{#if currentPriceUSD}}, which is currently trading at approximately {{{currentPriceUSD}}} USD{{/if}}, perform a comprehensive analysis.

{{#if tradingStyle}}
The user has selected the "{{{tradingStyle}}}" trading style. Your entire analysis, including entry points, stop-loss, take-profit targets, price outlook, investment advice, event-based triggers, and trading session insights, MUST be tailored to this style.
- **Conservative**: Focus on lower risk, potentially wider stops, longer hold times, smaller position sizes, and clearer confirmations. Event triggers might focus on broad market stability or significant positive news. Trading session insights should emphasize periods of stable liquidity. Long-term outlooks should be more cautious.
- **Swing Trader**: Focus on short-to-mid-term price movements, technical analysis, identifying swing highs/lows, with balanced risk/reward. Event triggers might be tied to technical breakouts or news directly impacting the coin's perceived value. Session insights should highlight potential session-based momentum shifts.
- **Scalper**: Focus on very short-term (intraday) micro-movements, tight stop-losses and take-profits, requiring high precision. Event triggers might be very sensitive to immediate volume spikes or order book imbalances. Session insights should focus on high-liquidity periods and very short-term volatility. Long-term outlooks are less relevant.
- **High-Risk/High-Reward**: Focus on momentum, hype, potentially higher volatility plays, with asymmetric upside but acknowledging significant risk. Event triggers might be more speculative, like major influencer mentions or early signs of a viral narrative. Session insights might pinpoint sessions known for speculative fervor. Long-term outlooks can be more ambitious but highly speculative.
- **AI Hybrid**: Explain how you are dynamically blending strategies based on current market conditions and coin characteristics. Event triggers might be a mix, adapting to the overall market context. Session insights should reflect this adaptive approach.
{{else}}
No specific trading style was selected by the user. Provide a balanced, general-purpose trading analysis and general event-based considerations and trading session insights.
{{/if}}

**CRITICAL INSTRUCTIONS FOR PRICE TARGETS AND ANALYSIS (IF 'currentPriceUSD' IS PROVIDED):**
{{#if currentPriceUSD}}
1.  **Current Price Context**: The current market price for {{coinName}} is {{{currentPriceUSD}}} USD. This value is your ABSOLUTE reference.
2.  **Numerical Targets**: ALL your numerical price targets in 'futurePriceOutlook' (shortTermTarget, midTermTarget, longTermTarget) and 'tradingTargets' (entryPoint, stopLoss, takeProfit1, takeProfit2, takeProfit3) MUST be plausible future values derived *directly* and *proportionally* from this {{{currentPriceUSD}}} USD. They must also reflect the chosen 'tradingStyle' if provided (e.g., tighter ranges for Scalper, potentially more ambitious targets for High-Risk).
    *   **Format these price strings normally**: For prices $0.01 or greater, use two decimal places (e.g., "$0.25", "$1.45"). For prices less than $0.01, use more appropriate precision (e.g., "$0.0012", "$0.000045").
    *   For example, if {{{currentPriceUSD}}} is $2.50, an entryPoint for a Swing Trader might be "$2.45", a stopLoss "$2.30", a takeProfit1 "$2.70", and a longTermTarget (if conservative) might be "$3.50". A Scalper might have an entry at $2.50, SL at $2.48, TP1 at $2.53, and longTermTarget would be "N/A" or less relevant.
    *   If {{{currentPriceUSD}}} is $0.005, a shortTermTarget for a High-Risk style might be "$0.0065" (a 30% increase) or an entryPoint around "$0.0048".
    *   Your targets should NOT be in a drastically different order of magnitude (e.g., $0.0000001x or $50000 if current is $2.50) unless an EXTREME, well-justified event (consistent with the trading style) is described in the 'detailedAnalysis'.
    *   Think in terms of reasonable percentage changes from {{{currentPriceUSD}}}, adjusted for the selected 'tradingStyle'.
3.  **Detailed Analysis Reference**: Your 'detailedAnalysis' text MUST also reference and be consistent with this current price of {{{currentPriceUSD}}} USD when discussing current market standing or potential price movements.
{{else}}
**Note: No specific current market price was provided for {{coinName}}. Your analysis and price targets will be more general estimations and should reflect this lack of a precise current price. However, still tailor the *nature* of the targets, advice, event-based triggers, and trading session insights to the selected 'tradingStyle' if provided. Format price strings normally: for prices $0.01 or greater, use two decimal places (e.g., "$0.25", "$1.45"). For prices less than $0.01, use more appropriate precision (e.g., "$0.0012", "$0.000045").**
{{/if}}

Imagine you have access to and have analyzed the following types of data:
- Historical price action, including identification of key support/resistance levels, potential price breakouts, and chart patterns.
- Volume spikes and trends, correlating them with price movements.
- Social media dynamics: Twitter/X trending topics, Telegram/Reddit mentions, and general sentiment shifts.
- Blockchain activity: Data from platforms like Ethereum, BSC, and Solana, including new/active wallets and specific whale trades (buys/sells and amounts).
- Technical Indicators: Including Moving Average Convergence Divergence (MACD), Relative Strength Index (RSI) (identifying overbought/oversold conditions), Exponential Moving Averages (EMA trends), and Bollinger Bands.
- News Sentiment: Overall bullish, bearish, or neutral sentiment from recent news.
- Behavioral Triggers: Indicators of FOMO (Fear Of Missing Out) or FUD (Fear, Uncertainty, Doubt) patterns.
- Developer Activity: Simulated or known developer activity.
- AI Forecast Agreement: Conceptual agreement with other AI forecasting models.
- Potential upcoming market events or catalysts: e.g., CPI data releases, major exchange listings, regulatory announcements, BTC dominance shifts.
- Typical liquidity and volatility patterns during major global trading sessions (U.S., Asian, European).

Based on your simulated multi-faceted analysis of these inputs, provide a trading signal for "{{coinName}}". Your response MUST adhere to the JSON output schema.

Ensure all output fields are populated:
1.  'recommendation': "Buy", "Sell", or "Hold".
2.  'reasoning': A concise (1-2 sentence) summary for the recommendation.
3.  'confidenceScore': An integer from 0 to 100 representing your confidence in this signal.
4.  'keyReasoningFactors': Provide 3-5 key factors that significantly influenced your signal. For each factor, specify:
    *   'factor': The name of the factor (e.g., "RSI (14D)", "Social Sentiment (Twitter)", "Whale Net Inflow (24h)").
    *   'value': The observed state or value (e.g., "68", "73% Positive", "$3.2M Inflow", "High").
    *   'impact': Its perceived impact on your signal recommendation ("Positive", "Negative", "Neutral").
5.  'detailedAnalysis': A comprehensive explanation. Articulate how the simulated factors (historical price, volume spikes, price breakouts, social media, on-chain activity, whale movements, technical indicators like MACD/RSI/EMA trends/Bollinger Bands, news sentiment, FOMO/FUD patterns, tokenomics{{#if currentPriceUSD}}, and the current price of {{{currentPriceUSD}}} USD{{/if}}) contribute to your recommendation. Be specific in your rationale. **This analysis must align with the selected 'tradingStyle'.**
6.  'futurePriceOutlook': (shortTermTarget, midTermTarget, **longTermTarget**) - These MUST be scaled from currentPriceUSD if provided and reflect the 'tradingStyle'. Define "long-term" contextually (e.g., 6-12 months, or based on project milestones). Format these price strings appropriately as per earlier instructions.
7.  'tradingTargets': (entryPoint, stopLoss, takeProfit1, takeProfit2, takeProfit3) - These MUST be scaled from currentPriceUSD if provided and reflect the 'tradingStyle'. Format these price strings appropriately as per earlier instructions.
8.  'investmentAdvice': Provide advanced and detailed investment advice as per the schema description, **explicitly tailored to the selected 'tradingStyle'**. It should cover portfolio allocation, entry/exit nuances, risk management, invalidation conditions, and what to monitor for "Hold" signals, all through the lens of the chosen style.
9.  **'eventBasedTriggers' (Optional but Highly Encouraged)**: Provide 1-3 plausible event-based triggers or conditional strategies relevant to "{{coinName}}" and the selected 'tradingStyle'. For each, specify 'eventName', 'triggerCondition', 'recommendedAction', and 'rationale'. Consider events like BTC dominance shifts, significant whale movements, CPI data releases, major exchange listing news, or relevant regulatory news.
10. **'tradingSessionInsights' (Optional but Encouraged)**: Provide detailed insights on how current or upcoming major global trading sessions (e.g., U.S. open, Asian session, European session) might influence the trading strategy for "{{coinName}}". Include potential timing considerations for entries or exits based on session-specific liquidity and volatility patterns, tailored to the user's 'tradingStyle'.
    *   **For example, for the U.S. session:** "Consider monitoring for increased volatility around the U.S. market open (9:30 AM EST) for potential breakout opportunities if following a momentum style."
    *   **Similarly, provide specific examples or characteristic patterns for the European session:** (e.g., "The European session (approx 3 AM - 12 PM EST) often sees initial reactions to overnight news from Asia and can set the tone before U.S. markets open. Swing traders might look for consolidation breakouts or trend continuations during mid-European hours, while scalpers could focus on liquidity around major market overlaps.")
    *   **And for the Asian session:** (e.g., "Liquidity may be thinner during late Asian hours (e.g., after 2 AM EST), so conservative traders should be cautious with large orders or widen stops. Early Asian session can sometimes follow U.S. closing momentum, offering opportunities for trend-following styles if volume supports.")
    Ensure these insights are practical and consider how different trading styles might approach these sessions.
11. 'disclaimer': The standard disclaimer.

Your goal is to explain your rationale clearly, as if drawing conclusions from the rich (simulated) dataset described, emphasizing technical indicators like RSI, EMA trends, price breakouts, and volume spikes where relevant.
Strictly adhere to scaling all price targets from the provided 'currentPriceUSD' and tailoring all advice, including event-based triggers and trading session insights, to the 'tradingStyle' if provided.
`,
});

const getCoinTradingSignalFlow = ai.defineFlow(
  {
    name: 'getCoinTradingSignalFlow',
    inputSchema: GetCoinTradingSignalInputSchema,
    outputSchema: GetCoinTradingSignalOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (output && !output.disclaimer) {
      output.disclaimer = "This AI-generated trading signal and analysis is for informational purposes only and not financial advice. Meme coins are highly speculative. DYOR and invest only what you can afford to lose.";
    }
    return output!;
  }
);

    
