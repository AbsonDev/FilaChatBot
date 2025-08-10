import { useEffect, useRef, useState } from "react";
import type { Message } from "@shared/schema";

interface WebSocketMessage {
  type: string;
  data: any;
  conversationId?: string;
}

interface UseWebSocketProps {
  conversationId: string;
  onMessage: (message: Message) => void;
  onTyping: (data: { isTyping: boolean; senderType: string }) => void;
}

export function useWebSocket({ conversationId, onMessage, onTyping }: UseWebSocketProps) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        
        // Join conversation
        if (conversationId) {
          ws.send(JSON.stringify({
            type: 'join_conversation',
            data: { conversationId }
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          
          switch (message.type) {
            case 'new_message':
              onMessage(message.data);
              break;
            case 'user_typing':
              onTyping(message.data);
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  const sendMessage = (message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      if (message.type) {
        // Direct message with type
        wsRef.current.send(JSON.stringify(message));
      } else {
        // Chat message
        wsRef.current.send(JSON.stringify({
          type: 'send_message',
          data: message,
          conversationId
        }));
      }
    }
  };

  useEffect(() => {
    if (conversationId) {
      connect();
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [conversationId]);

  return {
    isConnected,
    sendMessage,
  };
}
