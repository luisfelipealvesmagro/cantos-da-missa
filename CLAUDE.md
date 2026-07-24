# CLAUDE.md

Este arquivo orienta o Claude Code (claude.ai/code) ao trabalhar com o código deste repositório.

## Estilo de resposta

Toda sessão neste repositório: ativar skill `caveman` nível `full` desde o início, sem precisar pedir.

## Comandos

```bash
npm start                              # ng serve --open --port 5000 (service worker desativado em dev)
npm run build                          # ng build → dist/cantos-da-missa/browser
npm test                                # ng test (Karma/Jasmine)
ng test --include='**/song.service.spec.ts'   # roda um único arquivo de spec
npx http-server -p 8080 dist/cantos-da-missa/browser   # testa o comportamento de PWA/offline com um build real
ng build && firebase deploy            # deploy para o Firebase Hosting (https://cantos-da-missa.web.app)
```

Não há script de lint configurado.

## Arquitetura

PWA Angular 18 (componentes standalone + signals) para organizar cifras litúrgicas, sincronizando via Firestore com login Google.

### Sistema de papéis (Músico / Cantor)

O app tem exatamente dois papéis, e essa distinção molda a maior parte de `core/services`:
- **Músico**: acesso completo (cria/edita/exclui músicas, categorias, playlists; gerencia os cantores autorizados). Identificado por um e-mail fixo em `environment.musicoEmail`, resolvido instantaneamente a partir do auth — nunca espera uma leitura do Firestore.
- **Cantor**: visualizador somente-leitura. Não tem coleção própria no Firestore; lê os dados do músico através do `effectiveUid`.

`RoleService` (`core/services/role.service.ts`) calcula o `effectiveUid` a partir de um doc singleton `app/config` `{ musicoUid, cantorEmails[] }`: para o músico é o próprio uid (sem espera); para um cantor é o `musicoUid` lido desse doc de config (aguarda `isReady`/`snap`). `DbService` (`core/services/db.service.ts`) monta toda referência de coleção do Firestore (`users/{effectiveUid}/categories`, `.../songs`) a partir desse signal, então **todo acesso a dados — para os dois papéis — passa implicitamente pelo `RoleService.effectiveUid`**. `firestore.rules` espelha isso na camada de segurança: cantores têm acesso de leitura à subárvore do músico, nunca escrita. `role.guard.ts` bloqueia rotas de edição para cantores no lado do cliente. Usuários sem nenhum papel reconhecido caem na tela `cantor-access` ("aguardando liberação").

Ao mexer em acesso a dados, autenticação ou permissões, leia `role.service.ts` e `db.service.ts` juntos — são duas metades do mesmo mecanismo.

### Serviços de domínio (`core/services`)

- `chordpro.service.ts` — faz o parse do formato ChordPro (`[D]Eis-me a[G]qui`, `{c: Refrão}`) e converte cifras coladas no formato "acordes em cima da letra" para ChordPro.
- `transpose.service.ts` — transposição de acordes, 100% algorítmico (sem biblioteca externa).
- `category.service.ts` / `song.service.ts` / `playlist.service.ts` — CRUD, com backend Firestore quando logado.
- `seed.service.ts` — categorias padrão + músicas de exemplo para novos usuários.
- `backup.service.ts` — export/import completo em JSON.

### Módulos de feature (`features/`)

Cada um é uma área roteada e majoritariamente autocontida: `login`, `cantor-access`, `categories` (home), `song-list`, `song-view` (transposição/capo/fonte/auto-scroll), `song-edit` (preview ao vivo + botão "converter colado"), `playlists`, `playlist-edit` (reordenação drag-and-drop), `playlist-play` (modo apresentação).

`shared/chord-sheet` renderiza uma cifra parseada de forma reativa conforme os signals de transposição/capo/fonte mudam — é o núcleo de renderização compartilhado usado tanto por `song-view` quanto por `playlist-play`.

### Environments e o que não pode ser exposto

`src/environments/environment.ts` / `environment.prod.ts` guardam a config do Firebase + `musicoEmail`; copie a partir de `environment.example.ts` (template com placeholders, é o único dos três versionado). Os outros dois estão no `.gitignore` — nunca remova essa exclusão nem faça commit deles.

- O objeto `firebase` (`apiKey`, `authDomain`, `projectId`, etc.) não é um segredo de autenticação — é a config pública do app, esperada no bundle do client. Quem protege os dados são as `firestore.rules`, não o sigilo dessas chaves.
- `musicoEmail` é o dado sensível de verdade: é o e-mail com controle de acesso total (papel Músico). Não logue, exponha em mensagens de erro, nem inclua em prints/exemplos compartilhados.
- Nunca invente ou copie valores reais de `environment.ts`/`environment.prod.ts` em código, commits, issues ou respostas — trate qualquer valor visto neles como não reutilizável fora do ambiente local do usuário.

### Padronização de nomes de arquivos e pastas

- Pastas em kebab-case, uma por feature/componente: `features/song-view/`, `features/playlist-edit/`, `shared/chord-sheet/`.
- Dentro da pasta de um componente standalone, os três arquivos compartilham o mesmo nome base: `song-view.component.ts` / `.html` / `.scss`.
- Serviços ficam soltos (sem subpasta própria) em `core/services/`, nomeados `nome.service.ts` (ex.: `chordpro.service.ts`, `role.service.ts`).
- Guards ficam soltos em `core/guards/`, nomeados `nome.guard.ts`.
- Models ficam soltos em `core/models/`, nomeados `nome.model.ts` (ex.: `song.model.ts`).
- Utilitários sem estado (funções puras, sem `@Injectable`) vão em `shared/utils/`, nomeados pela função que exercem, sem sufixo (ex.: `normalize.ts`).
- Sempre kebab-case para arquivos e pastas — nunca camelCase ou PascalCase no nome do arquivo (a classe dentro dele é que é PascalCase).
