import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import TypingIndicator from "./typing-indicator";
import { Info } from "lucide-react";
import type { Message } from "@shared/schema";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-whatsapp-bg">
      {/* Welcome message */}
      <div className="flex justify-center">
        <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg text-sm max-w-md text-center">
          <Info className="inline w-4 h-4 mr-2" />
          Bem-vindo ao atendimento com Agente MCP! Como posso ajudá-lo hoje?
        </div>
      </div>

      {/* Messages */}
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );
}
