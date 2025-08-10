import { MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  isOnline: boolean;
  conversationId: string;
}

export default function ChatHeader({ isOnline }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-4 py-3 sm:py-4 safe-area-top">
      <div className="flex items-center space-x-3 max-w-4xl mx-auto">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageCircle className="text-white w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-gray-900 font-medium text-base sm:text-lg truncate">Chat</h1>
          <p className="text-xs sm:text-sm text-gray-500 flex items-center">
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            <span className="truncate">{isOnline ? 'Online' : 'Conectando...'}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
