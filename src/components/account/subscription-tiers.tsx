
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Star, Rocket } from "lucide-react";
import type { UserTier } from "@/context/tier-context"; // Import UserTier type

interface TierFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  name: UserTier; // Use UserTier type
  price: string;
  period: string;
  features: TierFeature[];
  ctaText: string;
  highlight?: boolean;
  isCurrent?: boolean; // This will be calculated based on props
}

const tiersData: Omit<SubscriptionPlan, 'isCurrent' | 'ctaText'>[] = [ // Base data without dynamic props
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    features: [
      { text: "Limited AI Signals (1 per day)", included: true },
      { text: "Basic Market Data", included: true },
      { text: "Watchlist (3 coins)", included: true },
      { text: "Custom AI Signals", included: false },
      { text: "Full Real-time AI Signals", included: false },
      { text: "AI Advisor Chat", included: false },
    ],
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    features: [
      { text: "Standard AI Signals (3 per day)", included: true },
      { text: "Full Market Data Access", included: true },
      { text: "Watchlist (10 coins)", included: true },
      { text: "Custom AI Signals (Limited)", included: false }, // Example: Basic gets some custom signals
      { text: "AI Advisor Chat (Limited)", included: true },
      { text: "Full Real-time AI Signals", included: false },
    ],
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "/month",
    features: [
      { text: "Full Real-time AI Signals (All Coins)", included: true },
      { text: "Advanced Market Data & Analytics", included: true },
      { text: "Unlimited Watchlist & Alerts", included: true },
      { text: "Priority AI Advisor Chat", included: true },
      { text: "Full Custom AI Signals Access", included: true },
      { text: "Exclusive Pro Features", included: true },
    ],
    highlight: true,
  },
];

interface SubscriptionTiersProps {
  currentActiveTier: UserTier;
  onTierChange: (newTier: UserTier) => void;
}

export function SubscriptionTiers({ currentActiveTier, onTierChange }: SubscriptionTiersProps) {
  
  const handleTierAction = (tierName: UserTier) => {
    if (tierName !== currentActiveTier) {
      // In a real app, this would trigger a checkout flow (e.g., PayPal)
      // For now, we'll just update the simulated tier.
      alert(`Simulating upgrade/downgrade to ${tierName}.`);
      onTierChange(tierName);
    }
  };

  const getButtonText = (tierName: UserTier): string => {
    if (tierName === currentActiveTier) return "Current Plan";
    // Simplified logic: could be "Upgrade" or "Downgrade"
    return `Switch to ${tierName}`; 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {tiersData.map((tier) => (
        <Card key={tier.name} className={`flex flex-col ${tier.highlight && tier.name !== currentActiveTier ? 'border-neon shadow-neon/30 shadow-lg' : tier.name === currentActiveTier ? 'border-primary ring-2 ring-primary' : ''}`}>
          <CardHeader className="text-center">
            {tier.highlight && <Rocket className="h-6 w-6 text-neon mx-auto mb-2" />}
            <CardTitle className={`text-xl ${tier.highlight && tier.name !== currentActiveTier ? 'text-neon' : tier.name === currentActiveTier ? 'text-primary' : ''}`}>{tier.name} Tier</CardTitle>
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
              onClick={() => handleTierAction(tier.name)}
              className={`w-full ${tier.name === currentActiveTier ? 'bg-muted text-muted-foreground cursor-default hover:bg-muted' : tier.highlight ? 'bg-neon text-background hover:bg-neon/90' : 'bg-primary hover:bg-primary/90'}`}
              disabled={tier.name === currentActiveTier}
            >
              {getButtonText(tier.name)}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
