
"use client";

import { useState, useRef, useEffect } from "react";
import { getCoinAdvice, type GetCoinAdviceOutput, type GetCoinAdviceInput } from "@/ai/flows/get-coin-advice";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Bot, User, Send, Sparkles, Info, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast"; 

interface Message {
  id: string;
  type: "user" | "bot" | "system";
  text: string;
  coinName?: string;
}

export function AiChatAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentCoin, setCurrentCoin] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast(); 

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuestion.trim() || isLoading) return;

    const userMessageText = currentQuestion;
    const coinContext = currentCoin.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      text: userMessageText,
      coinName: coinContext || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);
    
    setIsLoading(true);
    setCurrentQuestion(""); 

    let fetchedPriceUSD: number | undefined = undefined;
    let priceTimestamp: string | undefined = undefined;
    

    if (coinContext) {
      toast({ title: "Context Update", description: `Fetching live price for ${coinContext}...` });
      try {
        let coinId = coinContext.toLowerCase();
        const coinIdMappings: { [key: string]: string } = {
          "xrp": "ripple", "shiba inu": "shiba-inu", "dogecoin": "dogecoin",
        };
        coinId = coinIdMappings[coinId] || coinId.replace(/\s+/g, '-');
        
        const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`);
        if (response.ok) {
          const data = await response.json();
          if (data[coinId] && data[coinId].usd !== undefined) {
            fetchedPriceUSD = data[coinId].usd;
            priceTimestamp = new Date().toLocaleString(); // Capture timestamp here
            // Toast for price fetch success is removed as price will be in bot's message
          } else {
            toast({ title: "Price Fetch Warning", description: `Could not confirm live price for ${coinContext}. AI advice will be more general.`, variant: "default" });
          }
        } else {
           toast({ title: "Price Fetch Warning", description: `Could not confirm live price for ${coinContext}. AI advice will be more general. (API Status: ${response.status})`, variant: "default" });
        }
      } catch (fetchErr) {
        console.warn("Price fetch error for AI Advisor:", fetchErr);
        toast({ title: "Price Fetch Error", description: `Network error fetching price for ${coinContext}. AI advice will be general.`, variant: "default" });
      }
    }

    try {
      const adviceParams: GetCoinAdviceInput = {
        coinName: coinContext || "general crypto",
        question: userMessage.text,
        currentPriceUSD: fetchedPriceUSD,
        currentPriceTimestamp: priceTimestamp, // Pass the timestamp
      };
      const result: GetCoinAdviceOutput = await getCoinAdvice(adviceParams);
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: result.adviceDetail, // The AI will now be prompted to include price/date in this detail
      };
      setMessages((prev) => [...prev, botMessage]);

    } catch (err) {
      console.error("Error getting advice:", err);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        text: "Sorry, I encountered an error trying to get advice. The AI might be pondering too hard, please try again!",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  return (
    <Card className="shadow-lg w-full max-w-2xl flex flex-col min-h-[60vh] sm:min-h-[500px] sm:h-[65vh] sm:max-h-[700px]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center text-2xl text-primary">
            <Bot className="mr-2 h-6 w-6" /> AI Coin Advisor
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-foreground">
                <Info className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 text-sm">
              <p>
                Ask our AI any question about a specific meme coin (e.g., "What are the risks for Dogecoin?") 
                or general crypto topics (e.g., "Explain Bitcoin halving"). If you provide a coin name, the AI will use its current live price for context.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        <CardDescription>
          Ask questions about specific meme coins (live price context used if coin specified) or general crypto topics.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden flex flex-col">
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4 mb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end space-x-2",
                  msg.type === "user" ? "justify-end" : "justify-start"
                )}
              >
                {msg.type === "bot" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-5 w-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                 {msg.type === "system" && (
                  <Avatar className="h-8 w-8 opacity-70">
                    <AvatarFallback className="bg-muted text-muted-foreground border border-dashed">
                      <Info className="h-4 w-4"/>
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[70%] rounded-lg p-3 text-base sm:text-sm shadow",
                    msg.type === "user"
                      ? "bg-primary text-primary-foreground"
                      : msg.type === "system" 
                      ? "bg-background border border-dashed text-muted-foreground text-xs italic"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {msg.coinName && <p className="text-xs font-semibold mb-1 opacity-80">Topic: {msg.coinName}</p>}
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                 {msg.type === "user" && (
                  <Avatar className="h-8 w-8">
                     <AvatarFallback className="bg-secondary text-secondary-foreground">
                      <User className="h-5 w-5"/>
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            {isLoading && ( 
              <div className="flex items-center space-x-2 justify-start">
                <Avatar className="h-8 w-8">
                   <AvatarFallback className="bg-primary text-primary-foreground">
                      <Sparkles className="h-5 w-5"/>
                    </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg shadow">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="pt-4 border-t">
        <form onSubmit={handleSendMessage} className="flex w-full items-center space-x-2">
          <Input
            type="text"
            placeholder="Coin (optional, e.g. Doge)"
            value={currentCoin}
            onChange={(e) => setCurrentCoin(e.target.value)}
            className="w-1/3"
            disabled={isLoading}
          />
          <Input
            type="text"
            placeholder="Ask your question..."
            value={currentQuestion}
            onChange={(e) => setCurrentQuestion(e.target.value)}
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !currentQuestion.trim()} className="bg-neon text-background hover:bg-neon/90">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
