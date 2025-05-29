'use server';
/**
 * @fileOverview An AI agent that provides performance optimization advice.
 *
 * - optimizePerformance - A function that provides performance optimization suggestions.
 * - OptimizePerformanceInput - The input type for the optimizePerformance function.
 * - OptimizePerformanceOutput - The return type for the optimizePerformance function (string).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const OptimizePerformanceInputSchema = z.object({
  stack: z.string().describe('The frontend and backend tech stack used by the application (e.g., "React (Next.js) frontend, Node.js Express backend, MongoDB, TailwindCSS, Firebase Auth, PayPal SDK").'),
  currentIssues: z.string().describe('A description of the performance or loading problems currently being experienced (e.g., "Initial load is slow on mobile, API latency on specific data fetches, large bundle size").'),
});
export type OptimizePerformanceInput = z.infer<typeof OptimizePerformanceInputSchema>;

// The output is a string containing Markdown formatted advice.
const OptimizePerformanceOutputSchema = z.string().describe("Actionable performance improvement suggestions in Markdown format, covering frontend, backend, and infrastructure.");
export type OptimizePerformanceOutput = z.infer<typeof OptimizePerformanceOutputSchema>;

export async function optimizePerformance(input: OptimizePerformanceInput): Promise<string> {
  return optimizePerformanceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'optimizePerformancePrompt',
  input: {schema: OptimizePerformanceInputSchema},
  output: {schema: OptimizePerformanceOutputSchema}, // Outputting as a simple string
  prompt: `You are a senior full-stack engineer. A developer is seeking advice on performance and loading issues for their application.

**Tech Stack Used**:
{{{stack}}}

**Reported Issues**:
{{{currentIssues}}}

Please provide a list of actionable improvements. Structure your response in clear Markdown format.
Categorize your suggestions into:
1. Frontend Optimizations (e.g., code splitting, bundle optimization, image optimization, PWA considerations, state management, rendering strategies)
2. Backend Optimizations (e.g., database indexing, query optimization, caching strategies, API design)
3. Infrastructure Optimizations (e.g., CDN usage, hosting solutions, load balancing, serverless functions)

For each suggestion, briefly explain why it helps and provide concise code examples or specific tool recommendations where applicable.
Focus on practical and impactful advice.
`,
  config: {
    temperature: 0.4, // A slightly lower temperature for more factual, less creative advice
  }
});

const optimizePerformanceFlow = ai.defineFlow(
  {
    name: 'optimizePerformanceFlow',
    inputSchema: OptimizePerformanceInputSchema,
    outputSchema: OptimizePerformanceOutputSchema, // Outputting as a simple string
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!; // The output of the prompt is directly the string advice
  }
);
