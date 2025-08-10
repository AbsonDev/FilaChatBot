import { User } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-xs lg:max-w-md">
        <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3">
          <div className="flex items-center space-x-2">
            <span className="text-gray-500 text-sm">Digitando</span>
            <div className="flex space-x-1">
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
