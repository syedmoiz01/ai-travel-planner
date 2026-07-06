"use client";

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

import { sendChatMessage, type ChatMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm your AI travel assistant. Ask me anything — \"What should I do in Paris for 3 days?\" or \"Is December good for Switzerland?\"",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    try {
      const reply = await sendChatMessage(nextMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err instanceof Error
              ? `Sorry, I couldn't respond: ${err.message}`
              : "Sorry, something went wrong.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        size="icon-lg"
        className="fixed bottom-6 right-6 rounded-full shadow-lg z-50"
        aria-label="Open travel assistant"
      >
        <MessageCircle className="size-5" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-[min(90vw,360px)] h-[min(70vh,480px)] rounded-2xl border bg-card text-card-foreground shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <span className="font-medium text-sm">AI Travel Assistant</span>
        <button
          onClick={() => setOpen(false)}
          aria-label="Close travel assistant"
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 max-w-[85%] ${
              m.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted text-foreground"
            }`}
          >
            {m.content}
          </div>
        ))}
        {sending && (
          <div className="text-sm rounded-lg px-3 py-2 max-w-[85%] bg-muted text-muted-foreground">
            Thinking...
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2 p-3 border-t">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your trip..."
          disabled={sending}
        />
        <Button type="submit" disabled={sending || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
