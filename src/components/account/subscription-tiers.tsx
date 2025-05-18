
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Star, Rocket, ShieldCheck } from "lucide-react";
import type { UserTier } from "@/context/tier-context"; 
import { auth } from '@/lib/firebase'; // Import Firebase auth

interface TierFeature {
  text: string;
  included: boolean;
}

interface SubscriptionPlan {
  name: UserTier; 
  price: string;
  period: string;
  features: TierFeature[];
  ctaText?: string;
  highlight?: boolean;
  paypalPlanId?: string;
  icon?: React.ReactNode;
}

const tiersData: Omit<SubscriptionPlan, 'ctaText'>[] = [ 
  {
    name: "Free",
    price: "$0",
    period: "Forever",
    icon: <Star className="h-6 w-6 text-muted-foreground mx-auto mb-2" />,
    features: [
      { text: "Limited AI Signals (1 per day)", included: true },
      { text: "Basic Market Data", included: true },
      { text: "Watchlist (3 coins)", included: true },
      { text: "Custom AI Signals", included: false },
      { text: "Full Real-time AI Signals", included: false },
      { text: "AI Advisor Chat", included: false },
      { text: "Premium Support", included: false },
    ],
  },
  {
    name: "Basic",
    price: "$9.99",
    period: "/month",
    icon: <Rocket className="h-6 w-6 text-primary mx-auto mb-2" />,
    features: [
      { text: "Standard AI Signals (Top 10 coins)", included: true },
      { text: "Full Market Data Access", included: true },
      { text: "Watchlist (10 coins)", included: true },
      { text: "Custom AI Signals (Limited)", included: false }, 
      { text: "AI Advisor Chat (Limited)", included: false },
      { text: "Full Real-time AI Signals", included: false },
      { text: "Premium Support", included: false },
    ],
    paypalPlanId: "P-1G079065XJ172161KNAQPHQQ",
  },
  {
    name: "Pro",
    price: "$29.99",
    period: "/month",
    icon: <ShieldCheck className="h-6 w-6 text-neon mx-auto mb-2" />,
    features: [
      { text: "Full Real-time AI Signals (All Coins)", included: true },
      { text: "Advanced Market Data & Analytics", included: true },
      { text: "Unlimited Watchlist & Alerts", included: true },
      { text: "Full Custom AI Signals Access", included: true },
      { text: "Priority AI Advisor Chat", included: true },
      { text: "Whale Movement Alerts", included: true },
      { text: "Premium Support", included: false },
    ],
    highlight: true,
    paypalPlanId: "P-5GK21636B1377881VNAQPMFA",
  },
  {
    name: "Premium",
    price: "$49.99",
    period: "/month",
    icon: <Rocket className="h-6 w-6 text-purple-400 mx-auto mb-2" />,
    features: [
      { text: "All Pro Features Included", included: true },
      { text: "Exclusive AI Models & Early Access", included: true },
      { text: "API Access (Coming Soon)", included: true },
      { text: "Dedicated Account Manager", included: true },
      { text: "Highest Priority Support", included: true },
      { text: "Personalized Onboarding", included: true },
      { text: "Custom Prediction Requests (Limited)", included: true },
    ],
    paypalPlanId: "P-66R88029R2506591NNAQPPKQ",
    highlight: true,
  },
];

interface SubscriptionTiersProps {
  currentActiveTier: UserTier;
  onTierChange: (newTier: UserTier) => void; 
}

export function SubscriptionTiers({ currentActiveTier, onTierChange }: SubscriptionTiersProps) {
  
  const handlePayPalSubscription = (tierName: UserTier, planId?: string) => {
    if (!planId) {
      alert(`The ${tierName} plan is free or does not have a payment plan ID configured.`);
      return;
    }
    
    const currentUser = auth.currentUser;
    const userId = currentUser ? currentUser.uid : "USER_ID_NOT_AVAILABLE (User not logged in)";

    alert(`Simulating PayPal subscription for ${tierName} tier.\nPlan ID: ${planId}\nUser ID (as custom_id): ${userId}\n\nThis is where the actual PayPal JS SDK integration would begin. The user's tier would be updated via backend webhooks upon successful payment.`);
    
    // For demo purposes, call onTierChange to update the UI locally AFTER the alert.
    // In a real app, this onTierChange would likely be triggered by a Firestore listener
    // reacting to changes made by the backend webhook.
    onTierChange(tierName); 
  };

  const getButtonText = (tier: SubscriptionPlan): string => {
    if (tier.name === currentActiveTier) return "Current Plan";
    if (tier.name === "Free") return "Switch to Free"; 
    return `Subscribe to ${tier.name}`; 
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {tiersData.map((tier) => (
        <Card 
            key={tier.name} 
            className={`flex flex-col 
                ${tier.highlight && tier.name !== currentActiveTier && tier.name === "Pro" ? 'border-neon shadow-neon/30 shadow-lg' : ''}
                ${tier.highlight && tier.name !== currentActiveTier && tier.name === "Premium" ? 'border-purple-400 shadow-purple-400/30 shadow-lg' : ''}
                ${tier.name === currentActiveTier ? 'border-primary ring-2 ring-primary' : ''}
            `}
        >
          <CardHeader className="text-center">
            {tier.icon}
            <CardTitle className={`text-xl 
                ${tier.highlight && tier.name !== currentActiveTier && tier.name === "Pro" ? 'text-neon' : ''}
                ${tier.highlight && tier.name !== currentActiveTier && tier.name === "Premium" ? 'text-purple-400' : ''}
                ${tier.name === currentActiveTier ? 'text-primary' : ''}
            `}>
                {tier.name} Tier
            </CardTitle>
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
              onClick={() => {
                if (tier.name === "Free") {
                  if (currentActiveTier !== "Free") onTierChange("Free");
                } else if (tier.paypalPlanId) {
                  handlePayPalSubscription(tier.name, tier.paypalPlanId);
                }
              }}
              className={`w-full 
                ${tier.name === currentActiveTier ? 'bg-muted text-muted-foreground cursor-default hover:bg-muted' : ''}
                ${tier.highlight && tier.name === "Pro" && tier.name !== currentActiveTier ? 'bg-neon text-background hover:bg-neon/90' : ''}
                ${tier.highlight && tier.name === "Premium" && tier.name !== currentActiveTier ? 'bg-purple-500 text-white hover:bg-purple-600' : ''}
                ${!tier.highlight && tier.name !== "Free" && tier.name !== currentActiveTier ? 'bg-primary hover:bg-primary/90' : ''}
                ${tier.name === "Free" && tier.name !== currentActiveTier ? 'bg-secondary hover:bg-secondary/80' : ''}
              `}
              disabled={tier.name === currentActiveTier}
            >
              {getButtonText(tier)}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
