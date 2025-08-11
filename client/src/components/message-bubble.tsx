import { Check, CheckCheck } from "lucide-react";
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
        <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
          <div className="bg-blue-500 text-white rounded-2xl rounded-br-md px-3 sm:px-4 py-2 sm:py-2.5">
            <p className="text-sm sm:text-base leading-relaxed break-words">{message.content}</p>
          </div>
          <div className="flex items-center justify-end mt-1 space-x-1 px-1">
            <span className="text-xs text-gray-400">{timestamp}</span>
            {message.isRead ? (
              <CheckCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />
            ) : (
              <Check className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
          </div>
        </div>
      </div>
    );
  }

  if (isAgent) {
    return (
      <div className="flex justify-start">
        <div className="max-w-[85%] sm:max-w-xs lg:max-w-md">
          <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-2.5 shadow-sm">
            <p className="text-gray-800 text-sm sm:text-base leading-relaxed break-words">{message.content}</p>
          </div>
          <div className="flex items-center mt-1 px-1">
            <span className="text-xs text-gray-400">{timestamp}</span>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
