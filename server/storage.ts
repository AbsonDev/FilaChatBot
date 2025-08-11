import { type Conversation, type InsertConversation, type Message, type InsertMessage, type Agent, type InsertAgent } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Conversations
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined>;
  
  // Messages
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  markMessageAsRead(messageId: string): Promise<void>;
  
  // Agents
  getAvailableAgent(): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgentStatus(id: string, isOnline: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private agents: Map<string, Agent>;

  constructor() {
    this.conversations = new Map();
    this.messages = new Map();
    this.agents = new Map();
    
    // Create a default MCP agent
    this.createAgent({
      name: "Agente MCP - Filazero",
      isOnline: true,
      currentConversations: 0,
    });
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      id,
      userId: insertConversation.userId,
      agentId: insertConversation.agentId || null,
      status: insertConversation.status || "active",
      queuePosition: insertConversation.queuePosition || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    
    const updated = { ...conversation, ...updates, updatedAt: new Date() };
    this.conversations.set(id, updated);
    return updated;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      conversationId: insertMessage.conversationId,
      senderId: insertMessage.senderId,
      senderType: insertMessage.senderType,
      content: insertMessage.content,
      messageType: insertMessage.messageType || "text",
      isRead: insertMessage.isRead || false,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    return message;
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.isRead = true;
      this.messages.set(messageId, message);
    }
  }

  async getAvailableAgent(): Promise<Agent | undefined> {
    return Array.from(this.agents.values()).find(agent => agent.isOnline);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = randomUUID();
    const agent: Agent = {
      id,
      name: insertAgent.name,
      isOnline: insertAgent.isOnline || false,
      currentConversations: insertAgent.currentConversations || 0,
    };
    this.agents.set(id, agent);
    return agent;
  }

  async updateAgentStatus(id: string, isOnline: boolean): Promise<void> {
    const agent = this.agents.get(id);
    if (agent) {
      agent.isOnline = isOnline;
      this.agents.set(id, agent);
    }
  }
}

export const storage = new MemStorage();
