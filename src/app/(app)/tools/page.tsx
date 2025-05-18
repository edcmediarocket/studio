import { RoiCalculator } from "@/components/tools/roi-calculator";
import { AiChatAssistant } from "@/components/tools/ai-chat-assistant";
import { CoinComparisonTool } from "@/components/tools/coin-comparison-tool";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, BotMessageSquare, GitCompareArrows, Settings2 } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 mb-6">
          <TabsTrigger value="roi-calculator" className="text-base py-3">
            <Calculator className="mr-2 h-5 w-5" /> ROI Calculator
          </TabsTrigger>
          <TabsTrigger value="ai-chat" className="text-base py-3">
            <BotMessageSquare className="mr-2 h-5 w-5" /> AI Chat Advisor
          </TabsTrigger>
          <TabsTrigger value="coin-comparison" className="text-base py-3">
            <GitCompareArrows className="mr-2 h-5 w-5" /> Coin Comparison
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
      </Tabs>

      {/* Placeholder for Real-time On-chain Data Visualization */}
      {/* <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center text-2xl text-primary">
            <Activity className="mr-2 h-6 w-6" /> On-Chain Data Visualization (Coming Soon)
          </CardTitle>
          <CardDescription>
            Visualize real-time blockchain data for meme coins.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This section will feature tools for visualizing on-chain metrics like holder distribution, transaction volume, and smart contract interactions.
          </p>
        </CardContent>
      </Card> */}
    </div>
  );
}
