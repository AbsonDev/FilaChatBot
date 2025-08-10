import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatHeader from "@/components/chat-header";
import MessageList from "@/components/message-list";
import MessageInput from "@/components/message-input";
import { useWebSocket } from "@/hooks/use-websocket";
import { useMCPClient } from "@/hooks/use-mcp-client";
import type { Message, Conversation } from "@shared/schema";

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize conversation
  useEffect(() => {
    const initConversation = async () => {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-' + Math.random().toString(36).substring(7),
            status: 'active',
            queuePosition: Math.floor(Math.random() * 5) + 1,
          }),
        });
        const conversation: Conversation = await response.json();
        setConversationId(conversation.id);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    };

    initConversation();
  }, []);

  // Fetch existing messages
  const { data: existingMessages } = useQuery({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    enabled: !!conversationId,
  });

  useEffect(() => {
    if (existingMessages && Array.isArray(existingMessages)) {
      setMessages(existingMessages);
    }
  }, [existingMessages]);

  // WebSocket connection
  const { sendMessage, isConnected } = useWebSocket({
    conversationId,
    onMessage: (message: Message) => {
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    },
    onTyping: (data: { isTyping: boolean; senderType: string }) => {
      if (data.senderType === 'agent') {
        setIsTyping(data.isTyping);
      }
    },
  });

  // MCP client for queue management
  const { mcpStatus, queuePosition, waitTime } = useMCPClient();

  const handleSendMessage = (content: string) => {
    if (!conversationId || !content.trim()) return;

    const message = {
      conversationId,
      senderId: 'user',
      senderType: 'user' as const,
      content: content.trim(),
      messageType: 'text' as const,
      isRead: false,
    };

    sendMessage(message);
  };

  const handleTyping = (isTyping: boolean) => {
    if (conversationId) {
      sendMessage({
        type: 'typing',
        data: { isTyping, senderType: 'user' },
        conversationId,
      });
    }
  };

  if (!conversationId) {
    return (
      <div className="h-screen flex items-center justify-center bg-whatsapp-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-whatsapp-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-whatsapp-text">Conectando ao atendimento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-whatsapp-bg">
      <ChatHeader 
        isOnline={isConnected} 
        conversationId={conversationId}
      />
      
      <MessageList 
        messages={messages} 
        isTyping={isTyping}
      />
      
      <MessageInput 
        onSendMessage={handleSendMessage}
        onTyping={handleTyping}
      />
      
      {/* Connection Status */}
      <div className="bg-gray-50 border-t border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${mcpStatus ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-gray-600">Agente MCP</span>
            </div>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Fila: <span className="font-medium">{queuePosition}</span></span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-600">Tempo: <span className="font-medium">{waitTime}min</span></span>
          </div>
          <div className="text-gray-400">
            🔒 Seguro
          </div>
        </div>
      </div>
    </div>
  );
}
