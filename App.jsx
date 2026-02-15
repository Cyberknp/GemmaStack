import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Initialize the AI message placeholder
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Update the last message in state (the AI response)
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex].content += chunk;
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white max-w-3xl mx-auto border-x border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-blue-400" /> Gemma Bot
        </h1>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex max-w-[80%] gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0
                ${msg.role === "user" ? "bg-blue-600" : "bg-gray-700"}`}
              >
                {msg.role === "user" ? <User size={18} /> : <Bot size={18} />}
              </div>
              <div
                className={`p-3 rounded-2xl ${msg.role === "user" ? "bg-blue-700" : "bg-gray-800"}`}
              >
                <ReactMarkdown className="prose prose-invert prose-sm">
                  {msg.content ||
                    (isTyping && idx === messages.length - 1 ? "..." : "")}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-4 bg-gray-900 border-t border-gray-800"
      >
        <div className="relative flex items-center">
          <input
            className="w-full bg-gray-800 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            placeholder="Ask Gemma something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="absolute right-2 p-2 bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
            disabled={isTyping}
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
