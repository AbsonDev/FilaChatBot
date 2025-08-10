# Correção do Contexto do Terminal no Chat

## Problema Identificado
O chatbot não estava buscando informações do terminal antes de responder, resultando em respostas incorretas sobre os serviços disponíveis. Por exemplo, respondia sobre "fisioterapia" quando este serviço não estava disponível no terminal.

## Solução Implementada

### 1. Detecção de Primeira Mensagem
- Adicionada lógica para detectar quando é a primeira mensagem de uma conversa
- O sistema agora verifica se existem mensagens anteriores do usuário

### 2. Busca de Informações do Terminal
- Criado método `getTerminalInfo()` que:
  - Faz cache das informações do terminal por 5 minutos
  - Envia requisição ao Filazero Agent solicitando uso da ferramenta `get_terminal`
  - Passa o `accessKey` correto: `d6779a60360d455b9af96c1b68e066c5`

### 3. Contexto Enriquecido
- Na primeira mensagem, o sistema:
  - Adiciona instrução explícita para usar a ferramenta `get_terminal`
  - Inclui o `accessKey` no contexto
  - Marca a mensagem como `isFirstMessage`

### 4. Endpoints de Debug
Adicionados novos endpoints para facilitar testes e monitoramento:

- `GET /api/mcp/terminal-cache` - Visualiza status do cache
- `DELETE /api/mcp/terminal-cache/:sessionId?` - Limpa cache do terminal
- `POST /api/mcp/fetch-terminal` - Força busca de informações do terminal

## Como Funciona

1. **Nova Conversa Iniciada**: Quando um usuário envia a primeira mensagem
2. **Detecção Automática**: Sistema detecta que é a primeira mensagem
3. **Busca Terminal**: Chama `getTerminalInfo()` para obter dados do terminal
4. **Mensagem Enriquecida**: Adiciona instrução para o agente usar `get_terminal`
5. **Resposta Contextualizada**: Agente responde com informações corretas do terminal

## Exemplo de Fluxo

```javascript
// Primeira mensagem do usuário
"Eu quero saber dos seus serviços"

// Sistema adiciona automaticamente:
"[SYSTEM: Esta é a primeira mensagem da conversa. Use a ferramenta get_terminal com accessKey d6779a60360d455b9af96c1b68e066c5 para obter informações do terminal antes de responder]

Eu quero saber dos seus serviços"

// Agente então:
1. Usa get_terminal para buscar serviços disponíveis
2. Responde com informações corretas (ex: consulta, exame, etc.)
```

## Testando a Implementação

### Via API:
```bash
# Forçar busca de informações do terminal
curl -X POST http://localhost:3000/api/mcp/fetch-terminal \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "test-123"}'

# Ver status do cache
curl http://localhost:3000/api/mcp/terminal-cache

# Limpar cache
curl -X DELETE http://localhost:3000/api/mcp/terminal-cache
```

## Benefícios

1. **Respostas Precisas**: Bot sempre tem contexto correto do terminal
2. **Performance**: Cache evita chamadas desnecessárias
3. **Transparência**: Logs detalhados para debug
4. **Flexibilidade**: Endpoints de teste para validação

## Próximos Passos

- Monitorar logs para confirmar que `get_terminal` está sendo chamado
- Validar que as respostas estão corretas para cada terminal
- Ajustar tempo de cache se necessário (atualmente 5 minutos)