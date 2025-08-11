import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import ChatHeader from "@/components/chat-header";
import MessageList from "@/components/message-list";
import MessageInput from "@/components/message-input";
import { TerminalSetupScreen } from "@/components/terminal-config";
import { useWebSocket } from "@/hooks/use-websocket";
import { useMCPClient } from "@/hooks/use-mcp-client";
import { useTerminalConfig } from "@/hooks/use-terminal-config";
import type { Message, Conversation } from "@shared/schema";

export default function ChatPage() {
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  
  // Terminal configuration hook
  const { hasTerminal, currentTerminal } = useTerminalConfig();

  // Initialize conversation only when terminal is configured
  useEffect(() => {
    if (!hasTerminal) return;

    const initConversation = async () => {
      try {
        const response = await fetch('/api/conversations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'user-' + Math.random().toString(36).substring(7),
            status: 'active',
            queuePosition: Math.floor(Math.random() * 5) + 1,
            terminalAccessKey: currentTerminal?.accessKey, // Include terminal access key
          }),
        });
        const conversation: Conversation = await response.json();
        setConversationId(conversation.id);
      } catch (error) {
        console.error('Failed to create conversation:', error);
      }
    };

    initConversation();
  }, [hasTerminal, currentTerminal?.accessKey]);

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

  // Show terminal setup screen if no terminal is configured
  if (!hasTerminal) {
    return <TerminalSetupScreen />;
  }

  // Show loading if conversation is not initialized yet
  if (!conversationId) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Iniciando conversa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 relative">
      {/* Chat Header - Fixed */}
      <div className="flex-shrink-0 sticky top-0 z-10">
        <ChatHeader 
          isOnline={isConnected} 
          conversationId={conversationId}
        />
      </div>
      
      {/* Message List - Scrollable area */}
      <div className="flex-1 flex flex-col min-h-0">
        <MessageList 
          messages={messages} 
          isTyping={isTyping}
        />
      </div>
      
      {/* Message Input - Fixed at bottom */}
      <div className="flex-shrink-0 sticky bottom-0 z-10">
        <MessageInput 
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>
    </div>
  );
}
