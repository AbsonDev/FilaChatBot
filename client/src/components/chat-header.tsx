import { Headphones } from "lucide-react";

interface ChatHeaderProps {
  isOnline: boolean;
  conversationId: string;
}

export default function ChatHeader({ isOnline, conversationId }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-whatsapp-green rounded-full flex items-center justify-center">
            <Headphones className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-whatsapp-text font-semibold text-lg">Atendimento com Agente MCP</h1>
            <p className="text-sm text-gray-500 flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span>{isOnline ? 'Atendente online' : 'Conectando...'}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
            ID: #{conversationId.substring(0, 8)}
          </span>
        </div>
      </div>
    </header>
  );
}
