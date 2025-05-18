
"use client";

import { RoiCalculator } from "@/components/tools/roi-calculator";
import { Calculator as CalculatorIcon } from "lucide-react";

export default function RoiCalculatorPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <CalculatorIcon className="mr-3 h-8 w-8" /> ROI Calculator
        </h1>
        <p className="text-lg text-muted-foreground">
          Estimate potential ROI for meme coins using AI predictions.
        </p>
      </div>
      <RoiCalculator />
    </div>
  );
}
