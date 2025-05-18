"use client";

import { NewsBuzzAggregator } from "@/components/tools/news-buzz-aggregator";
import { Newspaper } from "lucide-react";

export default function NewsBuzzPage() {
  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <Newspaper className="mr-3 h-8 w-8" /> AI News & Social Buzz Aggregator
        </h1>
        <p className="text-lg text-muted-foreground">
          Get AI-synthesized highlights from recent news and social media for any meme coin.
        </p>
      </div>
      <NewsBuzzAggregator />
    </div>
  );
}