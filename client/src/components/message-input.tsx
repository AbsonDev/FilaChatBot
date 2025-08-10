import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Mic, MicOff } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function MessageInput({ onSendMessage, onTyping }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const recognitionRef = useRef<any>(null);

  // Verificar suporte para speech recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          setMessage(prev => prev + finalTranscript);
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

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
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
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

  const toggleRecording = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!speechSupported || !recognitionRef.current) return;

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (error) {
        console.error('Error starting speech recognition:', error);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (recognitionRef.current && isRecording) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  return (
    <div className="bg-white border-t border-gray-100 p-3 sm:p-4 safe-area-bottom">
      <div className="flex items-end space-x-2 sm:space-x-3 max-w-4xl mx-auto">
        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Digite sua mensagem..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-12 sm:pr-14 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 min-h-[44px] sm:min-h-[48px] max-h-[120px] text-sm sm:text-base"
            rows={1}
            maxLength={1000}
          />
          
          {/* Voice button inside textarea on mobile */}
          {speechSupported && (
            <Button
              type="button"
              onClick={toggleRecording}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-full transition-colors duration-200 sm:hidden ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
              }`}
              size="sm"
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          )}
        </div>

        {/* Voice button for desktop */}
        {speechSupported && (
          <Button
            type="button"
            onClick={toggleRecording}
            className={`hidden sm:flex p-3 rounded-full transition-colors duration-200 ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-600'
            }`}
            size="icon"
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
        )}

        {/* Send button */}
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="p-2 sm:p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Recording indicator */}
      {isRecording && (
        <div className="flex items-center justify-center mt-2 text-red-500 text-xs sm:text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
          Gravando... Clique no microfone para parar
        </div>
      )}
    </div>
  );
}
