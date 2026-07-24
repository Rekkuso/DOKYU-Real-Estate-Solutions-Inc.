"use client";

import { useChat, type UIMessage } from "@ai-sdk/react";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { messages, status, error, sendMessage } = useChat();
  const isLoading = status === "submitted" || status === "streaming";
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Hide on auth pages and admin routes
  const hiddenRoutes = ["/sign-in", "/sign-up", "/forgot-password", "/update-password", "/admin"];
  const isHidden = hiddenRoutes.some((route) => pathname?.startsWith(route));

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isHidden) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input?.trim()) return;
    sendMessage({ text: input, role: "user" } as any);
    setInput("");
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              onClick={() => setIsOpen(true)}
              className="w-16 h-16 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-[0_8px_30px_rgb(79,70,229,0.3)] text-white p-0 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-110 hover:-translate-y-1"
            >
              <MessageCircle className="w-7 h-7" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[650px] max-h-[85vh] bg-white/90 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden border border-white/60"
          >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 via-indigo-600 to-violet-600 p-5 flex justify-between items-center text-white shrink-0 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md shadow-inner border border-white/10">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg tracking-wide leading-tight">
                    DOKYU Assistant
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <p className="text-indigo-100 text-xs font-medium">Online & ready</p>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="relative z-10 text-white/80 hover:text-white hover:bg-white/20 rounded-full cursor-pointer h-9 w-9 transition-colors"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50/40">
              {messages.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="h-full flex flex-col items-center justify-center text-center space-y-5 px-6"
                >
                  <div className="w-20 h-20 bg-blue-50/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-inner border border-blue-100/50">
                    <Bot className="w-10 h-10 text-blue-500" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-xl font-semibold text-gray-800 tracking-tight">Welcome to DOKYU</h4>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      I'm your AI real estate assistant. I can help you find properties, answer buying questions, and guide your real estate journey.
                    </p>
                  </div>
                </motion.div>
              )}

              {messages.filter(m => m.parts ? m.parts.some(p => p.type === 'text' && (p as any).text.trim()) : (m as any).content?.trim()).map((m: UIMessage, i: number) => (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: 0.05, duration: 0.3 }}
                    className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {m.role === "assistant" && (
                      <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-4.5 h-4.5 text-blue-600" />
                      </div>
                    )}

                    <div
                      className={`px-5 py-3.5 rounded-2xl max-w-[82%] text-[15px] leading-relaxed whitespace-pre-wrap shadow-sm ${
                        m.role === "user"
                          ? "bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm"
                          : "bg-white border border-gray-100 text-gray-700 rounded-tl-sm"
                      }`}
                    >
                      {m.parts
                        .filter((p) => p.type === "text")
                        .map((p) => (p as any).text)
                        .join("")}
                    </div>

                    {m.role === "user" && (
                      <div className="w-9 h-9 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-4.5 h-4.5 text-gray-500" />
                      </div>
                    )}
                  </motion.div>
                ),
              )}

              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="flex gap-3 justify-start"
                >
                  <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4.5 h-4.5 text-blue-600" />
                  </div>
                  <div className="px-5 py-4 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce delay-200" />
                  </div>
                </motion.div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-4 flex items-start gap-2">
                  <div className="font-semibold">Error:</div>
                  <div className="flex-1">{error.message}</div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/70 backdrop-blur-xl border-t border-gray-100/50 shrink-0">
              <form
                onSubmit={handleSubmit}
                className="relative flex items-center shadow-xs rounded-2xl bg-white border border-gray-200/80 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-400 transition-all duration-300"
              >
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask about properties in Manila..."
                  className="w-full pl-5 pr-14 py-4 bg-transparent border-none focus:outline-none text-[15px] text-gray-700 placeholder:text-gray-400"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input?.trim()}
                  size="icon"
                  className="absolute right-2 top-2 bottom-2 h-auto w-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:shadow-none disabled:bg-gray-100 disabled:text-gray-400 cursor-pointer"
                >
                  <Send className="w-4.5 h-4.5 ml-0.5" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
