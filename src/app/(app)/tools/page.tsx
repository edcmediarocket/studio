
import { RoiCalculator } from "@/components/tools/roi-calculator";
import { AiChatAssistant } from "@/components/tools/ai-chat-assistant";
import { CoinComparisonTool } from "@/components/tools/coin-comparison-tool";
import { OnChainDataVisualizer } from "@/components/tools/on-chain-data-visualizer"; // New import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, BotMessageSquare, GitCompareArrows, Settings2, Activity } from "lucide-react"; // Added Activity

export default function ToolsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-neon mb-2 flex items-center">
          <Settings2 className="mr-3 h-8 w-8" /> Advanced Tools & Utilities
        </h1>
        <p className="text-lg text-muted-foreground">
          Leverage AI-powered tools for deeper meme coin insights and analysis.
        </p>
      </div>

      <Tabs defaultValue="roi-calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6"> {/* Updated grid classes */}
          <TabsTrigger value="roi-calculator" className="text-base py-3">
            <Calculator className="mr-2 h-5 w-5" /> ROI Calculator
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="text-base py-3">
            <BotMessageSquare className="mr-2 h-5 w-5" /> AI Chat Advisor
          </TabsTrigger>
          <TabsTrigger value="coin-comparison" className="text-base py-3">
            <GitCompareArrows className="mr-2 h-5 w-5" /> Coin Comparison
          </TabsTrigger>
          <TabsTrigger value="on-chain-visualizer" className="text-base py-3"> {/* New Tab Trigger */}
            <Activity className="mr-2 h-5 w-5" /> On-Chain Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="roi-calculator" id="roi-calculator">
          <RoiCalculator />
        </TabsContent>
        <TabsContent value="ai-chat" id="ai-chat">
          <AiChatAssistant />
        </TabsContent>
        <TabsContent value="coin-comparison" id="coin-comparison">
          <CoinComparisonTool />
        </TabsContent>
        <TabsContent value="on-chain-visualizer" id="on-chain-visualizer"> {/* New Tab Content */}
          <OnChainDataVisualizer />
        </TabsContent>
      </Tabs>
    </div>
  );
}
