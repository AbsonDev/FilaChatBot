import { MessageCircle } from "lucide-react";

interface ChatHeaderProps {
  isOnline: boolean;
  conversationId: string;
}

export default function ChatHeader({ isOnline }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-100 px-4 py-4">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <MessageCircle className="text-white w-4 h-4" />
        </div>
        <div>
          <h1 className="text-gray-900 font-medium text-base">Chat</h1>
          <p className="text-xs text-gray-500 flex items-center">
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            <span>{isOnline ? 'Online' : 'Conectando...'}</span>
          </p>
        </div>
      </div>
    </header>
  );
}
