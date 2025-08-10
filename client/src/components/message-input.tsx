import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
    }, 1000);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    onSendMessage(trimmedMessage);
    setMessage("");
    setIsTyping(false);
    onTyping(false);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const insertQuickResponse = (text: string) => {
    setMessage(text);
    textareaRef.current?.focus();
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="bg-white border-t border-gray-200 p-4">
      <div className="flex items-end space-x-3">
        {/* Attachment button */}
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-400 hover:text-gray-600"
        >
          <Paperclip className="w-5 h-5" />
        </Button>

        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-whatsapp-green focus:border-transparent placeholder-gray-400 min-h-[48px] max-h-32"
            rows={1}
            maxLength={1000}
          />
          
          {/* Character count */}
          <div className="absolute bottom-1 right-3 text-xs text-gray-400">
            <span>{message.length}</span>/1000
          </div>
        </div>

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="p-3 bg-whatsapp-green hover:bg-whatsapp-dark text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {/* Quick responses */}
      <div className="flex flex-wrap gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => insertQuickResponse("Obrigado!")}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full border-0"
        >
          Obrigado!
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => insertQuickResponse("Preciso de mais informações")}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full border-0"
        >
          Preciso de mais informações
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => insertQuickResponse("Como posso ajudar?")}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full border-0"
        >
          Como posso ajudar?
        </Button>
      </div>
    </div>
  );
}
