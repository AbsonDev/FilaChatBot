import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { mcpAgent } from "./mcp-agent";
import { insertConversationSchema, insertMessageSchema } from "@shared/schema";
import { z } from "zod";

interface WebSocketMessage {
  type: string;
  data: any;
  conversationId?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Create WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  const clients = new Map<string, { ws: WebSocket; conversationId?: string }>();

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket) => {
    const clientId = Math.random().toString(36).substring(7);
    clients.set(clientId, { ws });

    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'join_conversation':
            const client = clients.get(clientId);
            if (client) {
              client.conversationId = message.data.conversationId;
              clients.set(clientId, client);
            }
            break;

          case 'send_message':
            if (message.conversationId) {
              const newMessage = await storage.createMessage({
                conversationId: message.conversationId,
                senderId: message.data.senderId || 'user',
                senderType: message.data.senderType || 'user',
                content: message.data.content,
                messageType: 'text',
                isRead: false,
              });

              // Broadcast to all clients in the conversation
              clients.forEach((client) => {
                if (client.conversationId === message.conversationId && client.ws.readyState === WebSocket.OPEN) {
                  client.ws.send(JSON.stringify({
                    type: 'new_message',
                    data: newMessage
                  }));
                }
              });

              // Process message with MCP agent
              if (message.data.senderType === 'user') {
                // Show typing indicator first
                setTimeout(() => {
                  clients.forEach((client) => {
                    if (client.conversationId === message.conversationId && client.ws.readyState === WebSocket.OPEN) {
                      client.ws.send(JSON.stringify({
                        type: 'user_typing',
                        data: { isTyping: true, senderType: 'agent' }
                      }));
                    }
                  });
                }, 500);

                // Process with MCP agent
                setTimeout(async () => {
                  try {
                    // Extract accessKey from conversation context if available
                    const conversation = await storage.getConversation(message.conversationId!);
                    const accessKey = (conversation as any)?.terminalAccessKey;
                    
                    await mcpAgent.processMessage(message.conversationId!, message.data.content, accessKey);
                    
                    // Get the latest message from the agent
                    const messages = await storage.getMessagesByConversation(message.conversationId!);
                    const latestAgentMessage = messages
                      .filter(msg => msg.senderType === 'agent')
                      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())[0];

                    if (latestAgentMessage) {
                      // Stop typing and send response
                      clients.forEach((client) => {
                        if (client.conversationId === message.conversationId && client.ws.readyState === WebSocket.OPEN) {
                          client.ws.send(JSON.stringify({
                            type: 'user_typing',
                            data: { isTyping: false, senderType: 'agent' }
                          }));
                          
                          client.ws.send(JSON.stringify({
                            type: 'new_message',
                            data: latestAgentMessage
                          }));
                        }
                      });
                    }
                  } catch (error) {
                    console.error('MCP agent error:', error);
                  }
                }, 2500);
              }
            }
            break;

          case 'typing':
            // Broadcast typing indicator
            clients.forEach((client) => {
              if (client.conversationId === message.conversationId && 
                  client.ws.readyState === WebSocket.OPEN && 
                  client !== clients.get(clientId)) {
                client.ws.send(JSON.stringify({
                  type: 'user_typing',
                  data: message.data
                }));
              }
            });
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      clients.delete(clientId);
    });
  });

  // REST API routes
  app.post('/api/conversations', async (req, res) => {
    try {
      const validatedData = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(validatedData);
      res.json(conversation);
    } catch (error) {
      res.status(400).json({ error: 'Invalid conversation data' });
    }
  });

  app.get('/api/conversations/:id', async (req, res) => {
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation) {
        return res.status(404).json({ error: 'Conversation not found' });
      }
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch conversation' });
    }
  });

  app.get('/api/conversations/:id/messages', async (req, res) => {
    try {
      const messages = await storage.getMessagesByConversation(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch messages' });
    }
  });

  app.post('/api/messages', async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(validatedData);
      res.json(message);
    } catch (error) {
      res.status(400).json({ error: 'Invalid message data' });
    }
  });

  // MCP integration endpoints
  app.get('/api/mcp/status', async (req, res) => {
    try {
      const mcpStatus = await mcpAgent.checkMCPStatus();
      res.json({
        connected: mcpStatus.connected,
        latency: mcpStatus.latency,
        queuePosition: Math.floor(Math.random() * 5) + 1,
        waitTime: Math.floor(Math.random() * 10) + 1,
        agentsOnline: mcpStatus.connected ? 3 : 1,
        service: 'MCP Filazero',
        agent_id: 'mcp-agent-001'
      });
    } catch (error) {
      res.status(500).json({ error: 'MCP connection failed' });
    }
  });

  // Terminal validation endpoint
  app.post('/api/terminal/validate', async (req, res) => {
    try {
      const { accessKey } = req.body;
      
      if (!accessKey || typeof accessKey !== 'string') {
        return res.status(400).json({ 
          error: 'Access key é obrigatório',
          message: 'Por favor, forneça um access key válido' 
        });
      }

      // Trim and validate format
      const cleanAccessKey = accessKey.trim();
      if (cleanAccessKey.length < 10) {
        return res.status(400).json({ 
          error: 'Access key muito curto',
          message: 'Access key deve ter pelo menos 10 caracteres' 
        });
      }

      // Validate terminal using MCP agent
      const terminalInfo = await mcpAgent.validateTerminal(cleanAccessKey);
      
      res.json(terminalInfo);
    } catch (error) {
      console.error('Terminal validation error:', error);
      res.status(400).json({ 
        error: 'Falha na validação do terminal',
        message: error instanceof Error ? error.message : 'Terminal não encontrado ou access key inválido'
      });
    }
  });

  // Manual MCP call endpoint for testing
  app.post('/api/mcp/call', async (req, res) => {
    try {
      const { message, conversationId, accessKey } = req.body;
      if (!message || !conversationId) {
        return res.status(400).json({ error: 'Message and conversationId required' });
      }

      await mcpAgent.processMessage(conversationId, message, accessKey);
      res.json({ success: true, message: 'MCP agent processed message' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to call MCP agent' });
    }
  });

  // Terminal cache management endpoints
  app.get('/api/mcp/terminal-cache', async (req, res) => {
    try {
      const status = mcpAgent.getTerminalCacheStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get terminal cache status' });
    }
  });

  app.delete('/api/mcp/terminal-cache/:accessKey?', async (req, res) => {
    try {
      mcpAgent.clearTerminalCache(req.params.accessKey);
      res.json({ success: true, message: 'Terminal cache cleared' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to clear terminal cache' });
    }
  });

  // Force terminal info fetch endpoint for testing
  app.post('/api/mcp/fetch-terminal', async (req, res) => {
    try {
      const { accessKey, sessionId } = req.body;
      if (!accessKey) {
        return res.status(400).json({ error: 'accessKey required' });
      }

      const terminalInfo = await mcpAgent.getTerminalInfo(accessKey, sessionId);
      res.json({ success: true, terminalInfo });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch terminal info' });
    }
  });

  return httpServer;
}
