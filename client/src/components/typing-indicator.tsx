import { User } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-agent-bubble border border-gray-200 rounded-xl rounded-bl-sm px-4 py-3 shadow-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-6 h-6 bg-whatsapp-green rounded-full flex items-center justify-center">
              <User className="text-white w-3 h-3" />
            </div>
            <span className="text-xs text-gray-600 font-medium">Ana - Atendimento</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-gray-500 text-sm">Digitando</span>
            <div className="flex space-x-1 ml-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
