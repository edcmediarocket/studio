
"use client";

import { CustomSignalGenerator } from "@/components/tools/custom-signal-generator";
import { SlidersHorizontal } from "lucide-react";

export default function CustomSignalsPage() {
  return (
    <div className="space-y-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <SlidersHorizontal className="mr-3 h-8 w-8" /> Customizable AI Signals
        </h1>
        <p className="text-lg text-muted-foreground">
          Generate tailored AI trading signals by specifying coin, timeframe, and your risk profile.
        </p>
      </div>
      <CustomSignalGenerator />
    </div>
  );
}
