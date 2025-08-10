import { User, Check, CheckCheck } from "lucide-react";
import type { Message } from "@shared/schema";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.senderType === 'user';
  const isAgent = message.senderType === 'agent';
  const timestamp = new Date(message.createdAt!).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-user-bubble rounded-xl rounded-br-sm px-4 py-2 shadow-sm">
            <p className="text-whatsapp-text text-sm">{message.content}</p>
          </div>
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs text-gray-400">{timestamp}</span>
            {message.isRead ? (
              <CheckCheck className="w-3 h-3 text-blue-500" />
            ) : (
              <Check className="w-3 h-3 text-gray-400" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isAgent) {
    return (
      <div className="flex justify-start">
        <div className="max-w-xs lg:max-w-md">
          <div className="bg-agent-bubble border border-gray-200 rounded-xl rounded-bl-sm px-4 py-2 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-6 h-6 bg-whatsapp-green rounded-full flex items-center justify-center">
                <User className="text-white w-3 h-3" />
              </div>
              <span className="text-xs text-gray-600 font-medium">Agente MCP - Filazero</span>
            </div>
            <p className="text-whatsapp-text text-sm">{message.content}</p>
          </div>
          <div className="flex items-center mt-1">
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
