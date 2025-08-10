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
                    await mcpAgent.processMessage(message.conversationId!, message.data.content);
                    
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

  // Manual MCP call endpoint for testing
  app.post('/api/mcp/call', async (req, res) => {
    try {
      const { message, conversationId } = req.body;
      if (!message || !conversationId) {
        return res.status(400).json({ error: 'Message and conversationId required' });
      }

      await mcpAgent.processMessage(conversationId, message);
      res.json({ success: true, message: 'MCP agent processed message' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to call MCP agent' });
    }
  });

  return httpServer;
}
