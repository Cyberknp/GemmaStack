import React, { useState, useEffect, useRef } from "react";
import { Send, Bot, User } from "lucide-react";

export default function ChatApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();

    const trimmedInput = input.trim();
    if (!trimmedInput) return;

    try {
      setError("");

      // Add user message
      setMessages((prev) => [...prev, { role: "user", content: trimmedInput }]);
      setInput("");
      setIsTyping(true);

      // Add empty assistant message to be filled
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      console.log("Sending message:", trimmedInput);

      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedInput }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        // Update the last message (assistant response)
        setMessages((prev) => {
          if (prev.length === 0) return prev;
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = {
            ...newMessages[newMessages.length - 1],
            content: fullContent,
          };
          return newMessages;
        });
      }

      console.log("Message complete");
    } catch (err) {
      console.error("Error:", err);
      setError(`Error: ${err.message}`);

      // Remove the empty assistant message on error
      setMessages((prev) => {
        if (
          prev.length > 0 &&
          prev[prev.length - 1].role === "assistant" &&
          !prev[prev.length - 1].content
        ) {
          return prev.slice(0, -1);
        }
        return prev;
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Bot className="text-blue-400" size={24} /> Gemma Bot
        </h1>
      </div>

      {/* Error Message */}
      {error && (
        <div className="px-4 py-3 bg-red-900/30 border-b border-red-700 text-red-300 text-sm">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-4xl mx-auto w-full">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Start a conversation with Gemma!</p>
              <p className="text-sm text-gray-500 mt-2">Ask me anything...</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`flex gap-3 max-w-[80%] ${
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === "user" ? "bg-blue-600" : "bg-gray-700"
                }`}
              >
                {msg.role === "user" ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div
                className={`p-3 rounded-lg break-words ${
                  msg.role === "user" ? "bg-blue-700" : "bg-gray-800"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {msg.content ||
                    (isTyping && idx === messages.length - 1
                      ? "Thinking..."
                      : "")}
                </p>
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-gray-800 bg-gray-900 sticky bottom-0 w-full"
      >
        <div className="max-w-4xl mx-auto flex gap-3">
          <input
            type="text"
            className="flex-1 bg-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder-gray-500 disabled:opacity-50"
            placeholder="Ask Gemma something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            autoFocus
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg px-4 py-3 transition-colors flex items-center gap-2 font-medium"
            disabled={isTyping || !input.trim()}
          >
            <Send size={18} />
            {isTyping ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  );
}
