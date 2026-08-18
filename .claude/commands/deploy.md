---
description: Executa o build e faz o deploy no Firebase Hosting.
allowed-tools: Bash(git *), Bash(npm version *), Bash(ng build), Bash(npm run build), Bash(firebase deploy)
---

# Deploy (Firebase Hosting)

Publica uma nova versão do app em **https://cantos-da-missa.web.app**, conforme descrito no README (seção "Deploy").

## O que fazer

1. Rode `git status` para checar se há mudanças não commitadas ou arquivos não rastreados. Se houver qualquer um dos dois, avise o usuário quais arquivos estão pendentes e pergunte explicitamente se deseja continuar mesmo assim (sim/não) — só prossiga para o próximo passo após a resposta (o build usa o estado atual dos arquivos, commitados ou não).
2. Rode `npm version patch --no-git-tag-version` para incrementar o campo `version` do `package.json` (ex.: 1.1.0 → 1.1.1) — esse número aparece no app (rodapé da home) para identificar a versão publicada. Em seguida `git add package.json && git commit -m "chore: bump versão para X.X.X"` (use o número real gerado pelo `npm version`).
3. Rode `ng build` para gerar `dist/cantos-da-missa/browser`. Se o build falhar, pare e mostre o erro — não prossiga para o deploy.
4. Mostre um resumo curto do build (sucesso, tamanho do bundle se disponível) e peça confirmação explícita ao usuário antes de publicar, já que isso afeta o site em produção.
5. Só após a confirmação, execute `firebase deploy`.
6. Ao final, confirme o resultado e informe a URL publicada (https://cantos-da-missa.web.app).

Contexto adicional do usuário: $ARGUMENTS
