"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Star } from "lucide-react";

interface TierFeature {
  text: string;
  included: boolean;
}

interface SubscriptionTier {
  name: string;
  price: string;
  period: string;
  features: TierFeature[];
  isCurrent?: boolean;
  ctaText: string;
  highlight?: boolean;
}

const tiers: SubscriptionTier[] = [
  {
    name: "Free Tier",
    price: "$0",
    period: "Forever",
    features: [
      { text: "Delayed AI Signals", included: true },
      { text: "Basic Market Data", included: true },
      { text: "Limited Watchlist (3 coins)", included: true },
      { text: "Real-time AI Signals (Top 10 Coins)", included: false },
      { text: "Whale Alerts", included: false },
      { text: "Custom AI Predictions", included: false },
    ],
    ctaText: "Current Plan",
    isCurrent: true, // Example: User is on Free Tier
  },
  {
    name: "Basic Prophet",
    price: "$9.99",
    period: "/month",
    features: [
      { text: "Real-time AI Signals (Top 10 Coins)", included: true },
      { text: "Full Market Data Access", included: true },
      { text: "Expanded Watchlist (10 coins)", included: true },
      { text: "Basic AI Chat Support", included: true },
      { text: "Whale Alerts", included: false },
      { text: "Custom AI Predictions", included: false },
    ],
    ctaText: "Upgrade to Basic",
  },
  {
    name: "Pro Prophet",
    price: "$29.99",
    period: "/month",
    features: [
      { text: "Full Real-time AI Signals (All Coins)", included: true },
      { text: "Advanced Market Data & Analytics", included: true },
      { text: "Unlimited Watchlist & Alerts", included: true },
      { text: "Priority AI Chat Support", included: true },
      { text: "Real-time Whale Alerts", included: true },
      { text: "Custom AI Predictions & Analysis", included: true },
    ],
    ctaText: "Go Pro",
    highlight: true,
  },
];

export function SubscriptionTiers() {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl text-primary">Subscription Plans</CardTitle>
        <CardDescription>Choose the plan that best fits your meme coin trading strategy.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => (
          <Card key={tier.name} className={`flex flex-col ${tier.highlight ? 'border-neon shadow-neon/30 shadow-lg' : ''}`}>
            <CardHeader className="text-center">
              {tier.highlight && <Star className="h-6 w-6 text-neon mx-auto mb-2" />}
              <CardTitle className={`text-xl ${tier.highlight ? 'text-neon' : ''}`}>{tier.name}</CardTitle>
              <p className="text-3xl font-bold">
                {tier.price} <span className="text-sm font-normal text-muted-foreground">{tier.period}</span>
              </p>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-sm">
                    {feature.included ? (
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className={!feature.included ? 'text-muted-foreground line-through' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${tier.isCurrent ? 'bg-muted text-muted-foreground cursor-default hover:bg-muted' : tier.highlight ? 'bg-neon text-background hover:bg-neon/90' : 'bg-primary hover:bg-primary/90'}`}
                disabled={tier.isCurrent}
              >
                {tier.ctaText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
