import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import TypingIndicator from "./typing-indicator";
import type { Message } from "@shared/schema";

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
}

export default function MessageList({ messages, isTyping }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior,
        block: "end",
        inline: "nearest"
      });
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Scroll to bottom immediately on mount
  useEffect(() => {
    scrollToBottom("auto");
  }, []);

  return (
    <div 
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto overscroll-behavior-contain p-3 sm:p-6 space-y-3 scroll-smooth"
      style={{
        WebkitOverflowScrolling: 'touch', // Better scroll on iOS
      }}
    >
      {/* Spacer to push messages up */}
      <div className="min-h-4"></div>
      
      {/* Messages */}
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <div className="text-gray-400 text-lg mb-2">💬</div>
          <h3 className="text-gray-600 font-medium mb-1">Nenhuma mensagem ainda</h3>
          <p className="text-gray-400 text-sm px-4">
            Envie uma mensagem para começar a conversa ou use o botão de voz para ditar
          </p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}

      {/* Typing indicator */}
      {isTyping && <TypingIndicator />}

      {/* Scroll anchor */}
      <div ref={messagesEndRef} className="h-1" />
      
      {/* Bottom padding for better spacing */}
      <div className="h-4"></div>
    </div>
  );
}
