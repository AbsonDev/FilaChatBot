import { MessageCircle, Terminal } from "lucide-react";
import { TerminalConfigDialog } from "./terminal-config";
import { useTerminalConfig } from "@/hooks/use-terminal-config";

interface ChatHeaderProps {
  isOnline: boolean;
  conversationId: string;
}

export default function ChatHeader({ isOnline }: ChatHeaderProps) {
  const { currentTerminal } = useTerminalConfig();

  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-4 py-3 sm:py-4 safe-area-top">
      <div className="flex items-center space-x-3 max-w-4xl mx-auto">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
          <MessageCircle className="text-white w-4 h-4" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h1 className="text-gray-900 font-medium text-base sm:text-lg truncate">
            FilaChatBot
          </h1>
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}></span>
            <span className="truncate">{isOnline ? 'Online' : 'Conectando...'}</span>
            
            {/* Terminal Status */}
            {currentTerminal?.terminalInfo && (
              <>
                <span className="text-gray-300">•</span>
                <Terminal className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">
                  {currentTerminal.terminalInfo.name}
                </span>
                <span className="text-gray-400 text-xs hidden sm:inline">
                  ({currentTerminal.terminalInfo.provider.name})
                </span>
              </>
            )}
          </div>
        </div>
        
        {/* Configuration Button */}
        <div className="flex-shrink-0">
          <TerminalConfigDialog />
        </div>
      </div>
    </header>
  );
}
