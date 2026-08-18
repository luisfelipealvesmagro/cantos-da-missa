# Versão visível + auto-atualização do Service Worker

Data: 2026-08-18

## Problema

Depois de um deploy, os cantores demoram a ver a atualização — às vezes precisam dar vários refreshs no celular. Além disso, não há nenhum indicador de versão no app, então não dá para saber se todos estão na mesma versão.

Causa raiz: `provideServiceWorker` está configurado ([app.config.ts](../../../src/app/app.config.ts)), mas nada escuta `SwUpdate` — o Angular baixa a nova versão em segundo plano, mas ela só assume controle numa navegação futura, sem avisar ninguém. Também não existe nenhuma exibição de número de versão hoje.

## Decisões

- Quando uma nova versão for detectada, o app recarrega **automaticamente** (sem prompt para o usuário confirmar). Aceito o trade-off: se alguém estiver editando algo no exato momento do reload, o que não foi salvo se perde. Não será mitigado agora (YAGNI).
- Versão exibida vem do campo `version` do `package.json`, mostrada no rodapé da tela inicial (home / `categories`), visível para os dois papéis (músico e cantor).
- `package.json` começa em **1.1.0** e depois disso é incrementado (`patch`) automaticamente a cada deploy — não depende de lembrar manualmente.

## 1. Auto-atualização do Service Worker

Novo `core/services/update.service.ts` (`UpdateService`, `@Injectable({ providedIn: 'root' })`):

- Injeta `SwUpdate` (`@angular/service-worker`).
- Método `init()`:
  - Se `!swUpdate.isEnabled` (dev mode, SW desativado), não faz nada.
  - Assina `swUpdate.versionUpdates`, filtra eventos `VERSION_READY` → chama `document.location.reload()`.
  - Chama `swUpdate.checkForUpdate()`:
    - uma vez ao iniciar,
    - toda vez que `document.visibilitychange` disparar com `document.visibilityState === 'visible'` (cobre o celular voltando de tela bloqueada/segundo plano),
    - em um intervalo de 30 minutos enquanto o app estiver aberto (cobre sessões longas, ex.: `playlist-play` durante a missa toda).
  - Toda chamada a `checkForUpdate()` engole erros silenciosamente (`.catch(() => {})`) — evita barulho quando o celular está offline.

`AppComponent.ngOnInit()` ganha `this.update.init();` ao lado do `this.theme.init();` já existente, seguindo o mesmo padrão.

## 2. Exibir número de versão

- `tsconfig.json`: adicionar `"resolveJsonModule": true` em `compilerOptions`.
- Novo `shared/utils/app-version.ts`:
  ```ts
  export { version as APP_VERSION } from '../../../../package.json';
  ```
- `categories.component.ts`: importar `APP_VERSION` e expor `protected version = APP_VERSION;`.
- `categories.component.html`: junto da linha `{{ totalSongs() }} ... no total`, adicionar `<span class="version-tag">v{{ version }}</span>` — estilo discreto (fonte pequena, cor esmaecida) em `categories.component.scss`.

## 3. Bump automático a cada deploy

- Definir `package.json` `"version": "1.1.0"` como ponto de partida (parte desta implementação, não do fluxo de deploy).
- Editar `.claude/commands/deploy.md`: entre a checagem de `git status` (passo 1) e o `ng build` (passo 2 atual), inserir um novo passo:
  - Rodar `npm version patch --no-git-tag-version` (bump só do campo `version` do `package.json`, sem tag/commit automático do npm).
  - `git add package.json && git commit -m "chore: bump versão para X.X.X"`.
- Atualizar o frontmatter `allowed-tools` do comando para incluir `Bash(npm version *)` — `git add`/`git commit` já são cobertos pelo `Bash(git *)` existente.
- Resto do fluxo do deploy (build, resumo, confirmação, `firebase deploy`) permanece igual.

## Testando

Como o service worker fica desativado em `ng serve`, o comportamento de auto-reload só é observável com build de produção real: `ng build && npx http-server -p 8080 dist/cantos-da-missa/browser` (já documentado no CLAUDE.md), fazendo uma segunda build com mudança visível para simular um novo deploy e confirmando que a aba recarrega sozinha.

## Fora de escopo

- Prompt/confirmação antes de recarregar (usuário optou por reload silencioso).
- Proteção contra perda de dados de formulários abertos durante o reload.
- Exibir hash de commit ou data de build (optou por `package.json` version, manual/bump automático).
