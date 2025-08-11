import { storage } from "./storage";

// MCP Agent that handles intelligent responses using the Filazero Agent
export class MCPAgent {
  private filazeroAgentUrl: string;
  private agentId: string;
  private terminalCache: Map<string, any>;

  constructor() {
    // Always use Vercel agent (hardcoded fallback for reliability)
    this.filazeroAgentUrl = process.env.FILAZERO_AGENT_URL || "https://filazero-agent.vercel.app";
    this.agentId = "filazero-chatbot-proxy";
    this.terminalCache = new Map();
    
    console.log(`🔗 FilaChatBot MCP Agent initialized:`);
    console.log(`   Agent URL: ${this.filazeroAgentUrl}`);
    console.log(`   Agent ID: ${this.agentId}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  }

  // Get terminal information using the get_terminal tool
  async getTerminalInfo(accessKey: string, sessionId?: string): Promise<any> {
    try {
      // Use accessKey as cache key instead of sessionId
      const cacheKey = `terminal_${accessKey}`;
      
      // Check cache first
      if (this.terminalCache.has(cacheKey)) {
        const cached = this.terminalCache.get(cacheKey);
        // Cache for 5 minutes
        if (cached.timestamp > Date.now() - 300000) {
          console.log('📱 Using cached terminal info for accessKey:', accessKey.substring(0, 8) + '...');
          return cached.data;
        }
      }

      console.log(`🔍 Fetching terminal info for accessKey: ${accessKey.substring(0, 8)}...`);
      
      // Call the Filazero Agent API asking it to use get_terminal tool
      const response = await fetch(`${this.filazeroAgentUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `USE_TOOL: get_terminal com accessKey ${accessKey}`,
          sessionId: sessionId || `terminal-validation-${Date.now()}`,
          context: {
            forceToolUse: true,
            toolName: 'get_terminal',
            toolParams: {
              accessKey: accessKey
            }
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Terminal info retrieved via tool:', data);
        
        // Extract terminal data from response
        const terminalData = data.terminalData || data.toolResult || data.response;
        
        // Cache the terminal info by accessKey
        this.terminalCache.set(cacheKey, {
          data: terminalData,
          timestamp: Date.now()
        });
        
        return terminalData;
      } else {
        console.error(`❌ Failed to get terminal info: ${response.status}`);
        return null;
      }
    } catch (error) {
      console.error('❌ Error fetching terminal info:', error);
      return null;
    }
  }

  // Validate terminal with accessKey
  async validateTerminal(accessKey: string): Promise<any> {
    try {
      console.log(`🔐 Validating terminal with accessKey: ${accessKey.substring(0, 8)}...`);
      
      const terminalData = await this.getTerminalInfo(accessKey);
      
      if (terminalData) {
        // Parse terminal data if it's a string
        const terminal = typeof terminalData === 'string' ? JSON.parse(terminalData) : terminalData;
        
        console.log('✅ Terminal validation successful:', {
          id: terminal.id,
          name: terminal.name,
          provider: terminal.provider?.name,
          location: terminal.location?.name,
          services: terminal.services?.length || 0
        });
        
        return terminal;
      }
      
      throw new Error('Terminal não encontrado ou accessKey inválido');
    } catch (error) {
      console.error('❌ Terminal validation failed:', error);
      throw error;
    }
  }

  // Call Filazero Agent to get intelligent AI response
  async callMCP(userMessage: string, conversationContext: any, accessKey?: string): Promise<string> {
    try {
      console.log(`🤖 Calling Filazero Agent:`);
      console.log(`   URL: ${this.filazeroAgentUrl}/api/chat`);
      console.log(`   Message: ${userMessage}`);
      
      // Use provided accessKey or fallback to default for backward compatibility
      const terminalAccessKey = accessKey || conversationContext?.terminal_access_key || 'd6779a60360d455b9af96c1b68e066c5';
      console.log(`   Using terminal accessKey: ${terminalAccessKey.substring(0, 8)}...`);
      
      // Get terminal info if this is the first message or we don't have it
      let terminalInfo = conversationContext.terminal_info;
      let enhancedMessage = userMessage;
      
      if (!terminalInfo || conversationContext.is_first_message) {
        terminalInfo = await this.getTerminalInfo(terminalAccessKey, conversationContext.conversation_id);
        
        // For first message, prepend instruction to use get_terminal
        if (conversationContext.is_first_message) {
          enhancedMessage = `[SYSTEM: Esta é a primeira mensagem da conversa. Use a ferramenta get_terminal com accessKey ${terminalAccessKey} para obter informações do terminal antes de responder]\n\n${userMessage}`;
        }
      }
      
      // Call the Filazero Agent API
      const response = await fetch(`${this.filazeroAgentUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: enhancedMessage,
          sessionId: conversationContext?.conversation_id || `chat-${Date.now()}`,
          context: {
            userId: conversationContext?.user_id,
            queuePosition: conversationContext?.queue_position,
            previousMessages: conversationContext?.previous_messages?.slice(-3), // Last 3 messages
            terminalInfo: terminalInfo, // Include terminal information
            shouldUseTools: true, // Explicitly tell the agent to use tools
            requiredTools: ['get_terminal'], // Suggest using get_terminal tool
            isFirstMessage: conversationContext.is_first_message,
            terminalAccessKey: terminalAccessKey
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Filazero Agent response received:');
        console.log(`   Status: ${response.status}`);
        console.log(`   Response length: ${data.response?.length || 0} chars`);
        console.log(`   Tools used: ${data.toolsUsed || 'none'}`);
        return data.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
      } else {
        const errorText = await response.text();
        console.error(`❌ Filazero Agent error: ${response.status} ${response.statusText}`);
        console.error(`   Error details: ${errorText}`);
        throw new Error(`Filazero Agent returned ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Filazero Agent unavailable:', error);
      console.log('📱 Using fallback response...');
      return this.getLocalResponse(userMessage);
    }
  }

  // Local fallback responses when MCP is unavailable
  private getLocalResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    // Simple intent detection
    if (message.includes('olá') || message.includes('oi') || message.includes('bom dia') || message.includes('boa tarde') || message.includes('boa noite')) {
      return "Olá! Bem-vindo ao atendimento Filazero. Como posso ajudá-lo hoje?";
    }
    
    if (message.includes('obrigad') || message.includes('valeu') || message.includes('brigado')) {
      return "De nada! Fico feliz em ajudar. Há mais alguma coisa que posso fazer por você?";
    }
    
    if (message.includes('problema') || message.includes('erro') || message.includes('bug') || message.includes('não funciona')) {
      return "Entendo que você está enfrentando um problema. Pode me fornecer mais detalhes sobre o que está acontecendo? Vou verificar na nossa base de conhecimento e ajudá-lo a resolver.";
    }
    
    if (message.includes('preço') || message.includes('valor') || message.includes('custo') || message.includes('plano')) {
      return "Para informações sobre preços e planos, posso conectá-lo com nossa equipe comercial. Que tipo de solução você está procurando?";
    }
    
    if (message.includes('como usar') || message.includes('tutorial') || message.includes('ajuda') || message.includes('não sei')) {
      return "Claro! Ficarei feliz em orientá-lo. Pode me contar especificamente com o que você precisa de ajuda? Temos documentação e tutoriais disponíveis.";
    }
    
    if (message.includes('cancelar') || message.includes('cancelamento') || message.includes('sair')) {
      return "Entendo que você deseja cancelar. Para questões de cancelamento, vou conectá-lo com um atendente especializado que poderá ajudá-lo com esse processo.";
    }
    
    if (message.includes('técnico') || message.includes('suporte técnico') || message.includes('desenvolvedor')) {
      return "Para suporte técnico especializado, vou transferir você para nossa equipe de desenvolvedores. Eles poderão ajudá-lo com questões mais técnicas.";
    }
    
    // Default response
    return "Obrigado pela sua mensagem! Estou analisando sua solicitação e em breve fornecerei uma resposta detalhada. Enquanto isso, você pode me dar mais informações sobre o que precisa?";
  }

  // Process user message and generate intelligent response
  async processMessage(conversationId: string, userMessage: string, accessKey?: string): Promise<void> {
    try {
      // Get conversation context
      const conversation = await storage.getConversation(conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      
      // Check if this is the first message in the conversation
      const isFirstMessage = messages.filter(m => m.senderType === 'user').length === 0;
      
      const context = {
        conversation_id: conversationId,
        user_id: conversation?.userId,
        previous_messages: messages.slice(-5), // Last 5 messages for context
        queue_position: conversation?.queuePosition,
        is_first_message: isFirstMessage,
        terminal_info: null, // Will be fetched in callMCP if needed
        terminal_access_key: accessKey // Pass the accessKey in context
      };

      // Call MCP to get intelligent response with accessKey
      const response = await this.callMCP(userMessage, context, accessKey);

      // Create agent response message
      await storage.createMessage({
        conversationId,
        senderId: this.agentId,
        senderType: 'agent',
        content: response,
        messageType: 'text',
        isRead: false,
      });

    } catch (error) {
      console.error('Error processing message with MCP agent:', error);
      
      // Fallback error response
      await storage.createMessage({
        conversationId,
        senderId: this.agentId,
        senderType: 'agent',
        content: "Desculpe, estou enfrentando uma dificuldade técnica. Um atendente humano entrará em contato em breve.",
        messageType: 'text',
        isRead: false,
      });
    }
  }

  // Check Filazero Agent status
  async checkMCPStatus(): Promise<{connected: boolean, latency?: number}> {
    try {
      const startTime = Date.now();
      const response = await fetch(`${this.filazeroAgentUrl}/api/health`, {
        method: 'GET'
      });
      const latency = Date.now() - startTime;
      
      return {
        connected: response.ok,
        latency
      };
    } catch (error) {
      console.error('Failed to check Filazero Agent status:', error);
      return { connected: false };
    }
  }

  // Clear terminal cache for a specific accessKey or all cache
  clearTerminalCache(accessKey?: string): void {
    if (accessKey) {
      const cacheKey = `terminal_${accessKey}`;
      this.terminalCache.delete(cacheKey);
      console.log(`🗑️ Cleared terminal cache for accessKey: ${accessKey.substring(0, 8)}...`);
    } else {
      this.terminalCache.clear();
      console.log('🗑️ Cleared all terminal cache');
    }
  }

  // Get current terminal cache status
  getTerminalCacheStatus(): { size: number, terminals: string[] } {
    const terminals = Array.from(this.terminalCache.keys())
      .filter(key => key.startsWith('terminal_'))
      .map(key => key.replace('terminal_', '').substring(0, 8) + '...');
    
    return {
      size: this.terminalCache.size,
      terminals
    };
  }
}

export const mcpAgent = new MCPAgent();