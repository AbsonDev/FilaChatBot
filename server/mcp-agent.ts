import { storage } from "./storage";

// MCP Agent that handles intelligent responses using the Filazero Agent
export class MCPAgent {
  private filazeroAgentUrl: string;
  private agentId: string;

  constructor() {
    this.filazeroAgentUrl = process.env.FILAZERO_AGENT_URL || "http://localhost:3001";
    this.agentId = "filazero-chatbot-proxy";
  }

  // Call Filazero Agent to get intelligent AI response
  async callMCP(userMessage: string, conversationContext: any): Promise<string> {
    try {
      console.log(`🤖 Calling Filazero Agent: ${userMessage}`);
      
      // Call the Filazero Agent API
      const response = await fetch(`${this.filazeroAgentUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          sessionId: conversationContext?.conversation_id || `chat-${Date.now()}`,
          context: {
            userId: conversationContext?.user_id,
            queuePosition: conversationContext?.queue_position,
            previousMessages: conversationContext?.previous_messages?.slice(-3) // Last 3 messages
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Filazero Agent response received');
        return data.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
      } else {
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
  async processMessage(conversationId: string, userMessage: string): Promise<void> {
    try {
      // Get conversation context
      const conversation = await storage.getConversation(conversationId);
      const messages = await storage.getMessagesByConversation(conversationId);
      
      const context = {
        conversation_id: conversationId,
        user_id: conversation?.userId,
        previous_messages: messages.slice(-5), // Last 5 messages for context
        queue_position: conversation?.queuePosition
      };

      // Call MCP to get intelligent response
      const response = await this.callMCP(userMessage, context);

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
}

export const mcpAgent = new MCPAgent();