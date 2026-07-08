"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  Sparkles,
  AlertTriangle,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What causes migraines?",
  "How do I reduce fever?",
  "Can I take paracetamol after eating?",
  "Tips for better sleep",
];

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async (messageText?: string) => {
    const text = (messageText || input).trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setHasError(false);

    try {
      const history = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setHasError(true);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "I'm sorry, I encountered an error. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 rotate-90"
            : "gradient-primary hover:shadow-xl hover:shadow-primary/25"
        }`}
        aria-label={isOpen ? "Close chat" : "Open health assistant"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <MessageCircle className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Notification Dot (when closed and no messages yet) */}
      {!isOpen && messages.length === 0 && (
        <span className="fixed bottom-[4.25rem] right-6 z-50 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
        </span>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl animate-in slide-in-from-bottom-5 duration-300 max-[420px]:bottom-0 max-[420px]:right-0 max-[420px]:left-0 max-[420px]:top-0 max-[420px]:h-full max-[420px]:w-full max-[420px]:rounded-none">
          {/* Header */}
          <div className="gradient-primary px-4 py-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">
                    MediCore Health Assistant
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Powered by AI • Ask me anything about health
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1 hover:bg-white/20 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <h4 className="font-semibold text-base mb-1">
                  Hi there! 👋
                </h4>
                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  I&apos;m your AI health assistant. Ask me any general health
                  questions, and I&apos;ll do my best to help!
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-600 dark:text-amber-400 bg-amber-500/10 rounded-lg px-3 py-1.5 mb-4">
                  <AlertTriangle className="h-3 w-3 shrink-0" />
                  <span>Not a substitute for professional medical advice</span>
                </div>
                <div className="w-full space-y-2">
                  <p className="text-[11px] font-medium text-muted-foreground">
                    Try asking:
                  </p>
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="w-full text-left text-xs rounded-xl border px-3 py-2.5 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback
                    className={`text-[11px] font-bold ${
                      msg.role === "user"
                        ? "bg-primary text-white"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {msg.role === "user" ? (
                      <User className="h-3.5 w-3.5" />
                    ) : (
                      <Bot className="h-3.5 w-3.5" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-white rounded-tr-md"
                      : "bg-muted/70 rounded-tl-md"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <p key={i} className={i > 0 ? "mt-2" : ""}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5">
                <Avatar className="h-7 w-7 shrink-0 mt-0.5">
                  <AvatarFallback className="text-[11px] bg-emerald-500/10 text-emerald-600">
                    <Bot className="h-3.5 w-3.5" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted/70 rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-card px-3 py-2.5">
            <div className="flex items-end gap-2">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a health question..."
                className="min-h-[40px] max-h-[100px] resize-none rounded-xl border-muted-foreground/20 text-sm focus-visible:ring-primary/30"
                rows={1}
              />
              <Button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-10 w-10 shrink-0 rounded-xl gradient-primary text-white border-0 shadow-sm"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              AI responses are for informational purposes only
            </p>
          </div>
        </div>
      )}
    </>
  );
}
