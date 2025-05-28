"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2 } from "lucide-react";
import BotCard from "@/components/chat-bot/BotCard";
import BotTypingAnimation from "@/components/chat-bot/BotTypingAnimation";
import LoadingAnimation from "@/components/chat-bot/LoadingAnimation";
import "@/components/chat-bot/chat-bot.css";

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  items?: {
    type: "products" | "gifts" | null;
    ids: string[] | null;
  };
  isTyping?: boolean;
}

// تعريف مفتاح التخزين في localStorage
const CHAT_STORAGE_KEY = "cadoz_chat_messages";

// رسالة الترحيب الافتراضية
const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  text: "مرحباً! أنا مساعدك الشخصي في كادوز. كيف يمكنني مساعدتك في إيجاد هدية مثالية أو منتج يناسب احتياجاتك؟",
  isBot: true,
  items: null,
};

export default function ChatBotPage() {
  // استرجاع المحادثات المحفوظة من localStorage أو استخدام رسالة الترحيب الافتراضية
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const webhookUrl = process.env.NEXT_PUBLIC_WEBHOOK_URL;

  // استرجاع المحادثات من localStorage عند تحميل الصفحة
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(CHAT_STORAGE_KEY);
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as ChatMessage[];
        setMessages(parsedMessages);
      } else {
        // استخدام رسالة الترحيب الافتراضية إذا لم تكن هناك محادثات محفوظة
        setMessages([DEFAULT_WELCOME_MESSAGE]);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  }, []);

  // حفظ المحادثات في localStorage عند تغييرها
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  // وظيفة لبدء محادثة جديدة
  const startNewChat = () => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    setInputValue("");
    inputRef.current?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      isBot: false,
      items: null,
    };

    // Add user message
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Add typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: typingId, text: "", isBot: true, isTyping: true },
    ]);

    try {
      // Call webhook
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error("فشل في الاتصال بالخادم");
      }

      // Get the response text first
      const responseText = await response.text();
      console.log("Raw webhook response:", responseText);
      
      // Check if response is empty
      if (!responseText || responseText.trim() === "") {
        throw new Error("الاستجابة فارغة من الخادم");
      }
      
      // Try to parse the JSON safely
      let data;
      try {
        // Try to parse as JSON
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        
        // If it's not valid JSON but contains text, use the text directly
        if (responseText.length > 0) {
          data = { response: { text: responseText } };
        } else {
          throw new Error("تنسيق الاستجابة غير صحيح");
        }
      }
      
      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== typingId));

      // Process the response
      console.log("Full webhook response:", data);
      
      try {
        let botResponseText = "";
        let botResponseItems = null;
        let validResponseFound = false;
        
        console.log("Processing data:", data);
        
        // Try different possible response formats
        if (data && Array.isArray(data) && data.length > 0) {
          // Format 1: Array format
          for (const item of data) {
            if (item && item.response) {
              const response = item.response;
              console.log("Format 1 - Bot response extracted from array:", response);
              
              if (response.text) {
                botResponseText = response.text;
                validResponseFound = true;
                
                // Parse items if they exist
                if (response.items && response.items.type && response.items.ids) {
                  botResponseItems = {
                    type: response.items.type,
                    ids: response.items.ids
                  };
                }
                break; // Found valid response, exit loop
              }
            }
          }
        } else if (data && data.response) {
          // Format 2: Direct response object
          const response = data.response;
          console.log("Format 2 - Bot response extracted from object:", response);
          
          if (response.text) {
            botResponseText = response.text;
            validResponseFound = true;
            
            // Parse items if they exist
            if (response.items && response.items.type && response.items.ids) {
              botResponseItems = {
                type: response.items.type,
                ids: response.items.ids
              };
            }
          }
        } else if (data && data.text) {
          // Format 3: Direct text in data object
          console.log("Format 3 - Direct text in data object");
          botResponseText = data.text;
          validResponseFound = true;
          
          // Check for items directly in the data object
          if (data.items && data.items.type && data.items.ids) {
            botResponseItems = {
              type: data.items.type,
              ids: data.items.ids
            };
          }
        } else if (typeof data === 'string') {
          // Format 4: Plain text response
          console.log("Format 4 - Plain text response");
          botResponseText = data;
          validResponseFound = true;
        }
        
        // If no valid format was found, create a default response
        if (!validResponseFound) {
          console.warn("No valid response format found, using default message");
          botResponseText = "عذراً، لم أستطع فهم الاستجابة. هل يمكنك إعادة صياغة سؤالك؟";
          validResponseFound = true;
        }
        
        // Clean the text if it exists
        if (botResponseText) {
          // The text might be wrapped in quotes, so we need to clean it
          if (typeof botResponseText === 'string') {
            if (botResponseText.startsWith('"') && botResponseText.endsWith('"')) {
              botResponseText = botResponseText.substring(1, botResponseText.length - 1);
            }
            
            // Replace escaped newlines with actual newlines
            botResponseText = botResponseText.replace(/\\n/g, '\n');
            
            console.log("Cleaned text:", botResponseText);
          } else {
            // If botResponseText is not a string, convert it to a string
            botResponseText = JSON.stringify(botResponseText);
          }
        } else {
          botResponseText = "عذراً، لم أستطع الحصول على استجابة مناسبة. هل يمكنك إعادة صياغة سؤالك؟";
        }
        
        const botResponse: ChatMessage = {
          id: `bot-${Date.now()}`,
          text: botResponseText,
          isBot: true,
          items: botResponseItems,
        };

        // Add bot response with typing effect
        setMessages((prev) => [...prev, botResponse]);
      } catch (error) {
        console.error("Error processing bot response:", error);
        
        // Add error message
        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            text: error instanceof Error ? error.message : "عذراً، حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.",
            isBot: true,
            items: null,
          },
        ]);
      }
    } catch (error) {
      console.error("Error:", error);
      
      // Remove typing indicator
      setMessages((prev) => prev.filter((msg) => msg.id !== typingId));
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          text: "عذراً، حدث خطأ أثناء الاتصال. يرجى المحاولة مرة أخرى.",
          isBot: true,
          items: null,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-gradient-to-b from-purple-50 to-white overflow-hidden">
      <div className="container mx-auto px-4 py-6 flex flex-col h-full max-w-4xl">
        <div className="bg-white rounded-t-2xl shadow-lg p-4 mb-1">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-2xl font-bold text-purple-700">
              مساعد كادوز الذكي
            </h1>
            <button
              onClick={startNewChat}
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg text-sm transition-colors shadow-md flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              محادثة جديدة
            </button>
          </div>
          <p className="text-center text-gray-500 text-sm">
            اسألني عن أي هدية أو منتج وسأساعدك في العثور عليه
          </p>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-white rounded-b-2xl shadow-lg p-4 mb-4">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${
                    message.isBot ? "justify-start" : "justify-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      message.isBot
                        ? "bg-gradient-to-r from-purple-100 to-purple-50 text-gray-800 rounded-tl-none"
                        : "bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-tr-none"
                    }`}
                  >
                    {message.isTyping ? (
                      <BotTypingAnimation />
                    ) : (
                      <>
                        <div className="whitespace-pre-wrap text-sm">
                          {message.text}
                        </div>
                        
                        {/* Display BotCard if items exist */}
                        {message.isBot && message.items && message.items.ids && message.items.ids.length > 0 && (
                          <div className="mt-4 w-full">
                            <BotCard 
                              type={message.items.type} 
                              ids={message.items.ids} 
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-purple-100"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="اكتب سؤالك هنا..."
            className="w-full p-4 pr-12 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded-2xl"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-purple-600 text-white p-2 rounded-full hover:bg-purple-700 transition-colors disabled:bg-purple-300 shadow-md"
            disabled={isLoading || !inputValue.trim()}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </form>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center pointer-events-none z-10">
          <LoadingAnimation />
        </div>
      )}
    </div>
  );
}
