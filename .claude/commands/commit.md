---
description: Cria um commit semântico baseado nas mudanças atuais.
allowed-tools: Bash(git *)
model: claude-haiku-4-5-20251001
---

# Criar Commit Semântico

Analise as mudanças staged com `git diff --staged` e crie um commit seguindo Conventional Commits.

## Regras
- Prefixo: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `style`
- Formato: `tipo(escopo): descrição curta em português brasil`
- Máximo 72 caracteres na primeira linha
- Se tiver argumento ($ARGUMENTS), use como contexto extra

## O que fazer
1. Rode `git status` para ver o estado atual
2. Rode `git diff --staged` para ver o que está staged
3. Se não houver nada staged, rode `git add -A` primeiro e confirme com o usuário
4. Crie a mensagem de commit ideal
5. Mostre ao usuário um resumo do commit (arquivos alterados e a mensagem/descrição proposta) e peça confirmação antes de commitar
6. Só após a confirmação, execute `git commit -m "mensagem"`
7. Depois do commit, pergunte ao usuário se deseja fazer push para o repositório remoto (sim ou não). Se confirmado, execute `git push origin <branch-atual>`, detectando a branch atual com `git branch --show-current`

Contexto adicional do usuário: $ARGUMENTS