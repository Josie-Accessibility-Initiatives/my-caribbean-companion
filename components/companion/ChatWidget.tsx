"use client";

import {
  memo,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import {
  CHAT_DAILY_LIMIT,
  CHAT_REMAINING_HEADER,
  MAX_MESSAGE_LENGTH,
  type ChatUsage,
} from "@/lib/chat-limits";
import ChatMarkdown from "@/components/companion/ChatMarkdown";
import { fetchJson } from "@/lib/fetch-json";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

interface ChatWidgetProps {
  userContext?: {
    homeCountry?: string;
    targetCountry?: string;
    category?: string;
  };
  className?: string;
}

const STARTER_PROMPTS = [
  "Am I eligible to work in this country?",
  "What documents do I need for my profession?",
  "How long does the Skills Certificate take?",
];

const MAX_INPUT_HEIGHT_PX = 90; // ~3 rows at the chat-input font size + line-height

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

/**
 * One chat bubble. Memoised so typing in the input or streaming into the
 * latest reply doesn't re-render (and re-parse the Markdown of) older messages.
 */
const MessageRow = memo(function MessageRow({
  message,
  showTyping,
}: {
  message: Message;
  showTyping: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`chat-row ${isUser ? "chat-row-user" : "chat-row-assistant"}`}>
      {!isUser && (
        <div className="chat-avatar" aria-hidden="true">
          CC
        </div>
      )}
      <div className="chat-bubble-wrap">
        <div className={`chat-bubble ${isUser ? "chat-bubble-user" : "chat-bubble-assistant"}`}>
          {showTyping ? (
            <span className="chat-typing" aria-label="Assistant is typing">
              <span />
              <span />
              <span />
            </span>
          ) : isUser ? (
            message.content
          ) : (
            <ChatMarkdown content={message.content} />
          )}
        </div>
        <div className="chat-timestamp">{formatTime(message.timestamp)}</div>
      </div>
    </div>
  );
});

export default function ChatWidget({
  userContext,
  className,
}: ChatWidgetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [waitingForFirstChunk, setWaitingForFirstChunk] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Messages left today (null until loaded from GET /api/chat).
  const [remaining, setRemaining] = useState<number | null>(null);
  const outOfMessages = remaining === 0;

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load today's usage so the counter shows before the first message.
  useEffect(() => {
    fetchJson<ChatUsage>("/api/chat")
      .then((usage) => setRemaining(usage.remaining))
      .catch(() => {
        /* the counter is informational */
      });
  }, []);

  // Auto-resize the textarea up to 3 rows.
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, MAX_INPUT_HEIGHT_PX)}px`;
  }, [input]);

  const send = async (rawText?: string) => {
    const content = (rawText ?? input).trim();
    if (!content || streaming || outOfMessages) return;

    const userMsg: Message = {
      role: "user",
      content,
      timestamp: new Date(),
    };
    const assistantPlaceholder: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };

    const withUser = [...messages, userMsg];
    setMessages([...withUser, assistantPlaceholder]);
    setInput("");
    setError(null);
    setStreaming(true);
    setWaitingForFirstChunk(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: withUser.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userContext,
        }),
      });

      if (!response.ok) {
        let errMsg = "AI service unavailable. Please try again.";
        try {
          const data = await response.json();
          if (data?.error) errMsg = data.error;
          if (data?.code === "daily_limit_reached") setRemaining(0);
        } catch {
          /* ignore non-JSON error body */
        }
        throw new Error(errMsg);
      }

      const left = response.headers.get(CHAT_REMAINING_HEADER);
      if (left !== null) setRemaining(Number(left));
      if (!response.body) throw new Error("No stream available.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let firstChunk = true;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        if (!chunk) continue;

        if (firstChunk) {
          setWaitingForFirstChunk(false);
          firstChunk = false;
        }

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last && last.role === "assistant") {
            updated[updated.length - 1] = {
              ...last,
              content: last.content + chunk,
            };
          }
          return updated;
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
      // Drop the empty assistant placeholder so the failed turn doesn't leave a ghost bubble.
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant" && last.content === "") {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setStreaming(false);
      setWaitingForFirstChunk(false);
    }
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void send();
    }
  };

  const isEmpty = messages.length === 0;

  return (
    <div className={`chat-widget${className ? ` ${className}` : ""}`}>
      <div className="chat-header">
        <div className="chat-title">Caribbean Companion AI</div>
        <div className="chat-subtitle">
          Powered by Gemini
          {remaining !== null &&
            ` · ${remaining} of ${CHAT_DAILY_LIMIT} messages left today`}
        </div>
      </div>

      <div className="chat-messages" ref={scrollRef}>
        {isEmpty && (
          <div className="chat-starter">
            <p className="chat-starter-prompt">
              Hi! Ask me anything about moving and working across the
              Caribbean. Try one of these to get started:
            </p>
            <div className="chat-starter-chips">
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="chat-starter-chip"
                  onClick={() => void send(prompt)}
                  disabled={streaming || outOfMessages}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <MessageRow
            key={idx}
            message={message}
            showTyping={
              idx === messages.length - 1 &&
              message.role === "assistant" &&
              waitingForFirstChunk &&
              message.content === ""
            }
          />
        ))}

        {error && (
          <div className="chat-error" role="alert">
            {error}
          </div>
        )}
      </div>

      <div className="chat-input-area">
        <textarea
          ref={textareaRef}
          className="chat-input"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            outOfMessages
              ? "You've used today's messages. Come back tomorrow."
              : "Ask me anything about moving to another Caribbean country..."
          }
          disabled={streaming || outOfMessages}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        <button
          type="button"
          className="chat-send-btn"
          onClick={() => void send()}
          disabled={streaming || outOfMessages || !input.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
}
