# 🚀 Deploy Instructions for FilaChatBot

## Integration with Filazero Agent

This project is configured to work with the **Filazero Agent** backend deployed on Vercel.

### 📡 Environment Configuration

#### All Environments (Development + Production)
```env
FILAZERO_AGENT_URL=https://filazero-agent.vercel.app
```
**✅ Real URL**: https://filazero-agent.vercel.app

**Note**: Both development and production use the same Vercel agent URL. This allows testing in Replit and other cloud environments without running a local agent.

### 🔧 Setup Steps

1. **Deploy Filazero Agent First:**
   - ✅ **DEPLOYED**: https://filazero-agent.vercel.app is live and working
   - Test the health endpoint: `https://filazero-agent.vercel.app/api/health`

2. **Configure Environment:**
   - All environments use the same Vercel URL
   - `.env` and `.env.production` both point to https://filazero-agent.vercel.app
   - Perfect for Replit, local development, and production

3. **Run FilaChatBot:**
   ```bash
   # Development
   npm run dev
   
   # Production Build
   npm run build
   npm start
   ```

### 🌐 CORS Configuration

The Filazero Agent is already configured to accept requests from:
- `*.vercel.app` domains
- Common localhost ports (3000, 3001, 5173)

### 🧪 Testing Integration

1. **Health Check:**
   ```bash
   curl https://filazero-agent.vercel.app/api/health
   ```
   **Expected**: `{"status":"healthy","services":{"groq":"connected","mcp":"connected"}}`

2. **Chat Test:**
   ```bash
   curl -X POST https://filazero-agent.vercel.app/api/chat \
     -H "Content-Type: application/json" \
     -d '{"message": "Olá!", "sessionId": "test"}'
   ```
   **Expected**: Portuguese response from Filazero Assistant

3. **Current Status**: 
   - ✅ API responding
   - ⚠️ Groq model needs update in production (deploy latest changes)

3. **Local Test (when FilaChatBot is running):**
   - Open browser to http://localhost:3000
   - Send a message in the chat interface
   - Check browser console and server logs for connectivity

### 📋 Deployment Checklist

- [ ] Filazero Agent deployed and healthy
- [ ] Environment variables configured
- [ ] CORS working between frontend and agent  
- [ ] Chat messages flowing through the integration
- [ ] MCP tools executing (e.g., terminal lookup)
- [ ] IA responses in Portuguese

### 🔄 Architecture Flow

```
User → FilaChatBot Frontend → FilaChatBot Backend → Filazero Agent → Groq AI → MCP Server → Filazero API
```

### 🐛 Troubleshooting

**Connection Refused:**
- Check if FILAZERO_AGENT_URL is correct
- Verify Vercel deployment is healthy
- Check CORS configuration

**No AI Response:**
- Check if Groq API key is configured in Filazero Agent
- Verify MCP server is accessible
- Check agent logs for errors