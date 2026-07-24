---
description: Executar verificação de vulnerabilidades de segurança
allowed-tools: Read, Grep, Glob
model: claude-sonnet-5
---

Analise a base de código em busca de vulnerabilidades de segurança, incluindo:
- Riscos de injeção (SQL, comandos, etc.)
- Vulnerabilidades de XSS
- Credenciais expostas (chaves de API, tokens, senhas em texto puro)
- Configurações inseguras (ex.: `firestore.rules` permissivas, CORS aberto)

Contexto adicional do usuário (se houver): $ARGUMENTS