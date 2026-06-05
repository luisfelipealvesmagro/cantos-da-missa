# Cantos da Missa 🎸✝️

PWA em **Angular 18** para organizar cifras de músicas litúrgicas por categoria.
Funciona offline, instala no note/celular/tablet e guarda tudo localmente — **sem back-end**.

## Recursos

- Categorias da missa já cadastradas (Entrada, Ato Penitencial, Glória, Aclamação,
  Ofertório, Comunhão, Pós-Comunhão, Canto Final, Especiais) — e você pode criar/excluir as suas.
- Cifras em formato **ChordPro** (`[D]Eis-me a[G]qui`), com seção (`{c: Refrão}`).
- Visualizador com **transposição de tom** (±semitom ou escolha direta), **capotraste**,
  ajuste de **fonte** e **rolagem automática** com controle de velocidade.
- **Editor com pré-visualização ao vivo** e botão **"Converter colado"**: cole uma cifra no
  formato "acordes em cima da letra" e ele converte para ChordPro automaticamente.
- **Tema claro/escuro** (respeita a preferência do sistema, com alternância manual).
- **Backup**: exporta/importa toda a base como JSON (para mover entre aparelhos hoje).

## Rodando

```bash
npm install
npm start            # ng serve → http://localhost:4200
```

> Em `ng serve` o service worker fica desativado (comportamento padrão do Angular).
> Para testar o modo PWA/offline de verdade, gere o build e sirva os arquivos estáticos:

```bash
npm run build        # gera dist/cantos-da-missa/browser
npx http-server -p 8080 dist/cantos-da-missa/browser   # ou qualquer servidor estático
```

## Arquitetura

```
src/app/
├── core/
│   ├── models/        Category, Song
│   └── services/
│       ├── db.service.ts          IndexedDB (Dexie)
│       ├── category.service.ts    CRUD de categorias (signals via liveQuery)
│       ├── song.service.ts        CRUD de músicas
│       ├── transpose.service.ts   transposição de acordes (núcleo, 100% algorítmico)
│       ├── chordpro.service.ts    parser ChordPro + conversor "colado → ChordPro"
│       ├── theme.service.ts       tema claro/escuro
│       ├── seed.service.ts        categorias padrão + exemplos
│       └── backup.service.ts      export/import JSON
├── shared/
│   ├── icon/          wrapper de Material Symbols
│   └── chord-sheet/   renderiza a cifra com transposição reativa
└── features/
    ├── categories/    tela inicial
    ├── song-list/     músicas da categoria (com busca)
    ├── song-view/     visualizador (tom, capo, fonte, auto-scroll)
    └── song-edit/     editor com preview
```

## Deploy (Firebase Hosting)

O app está publicado em **https://cantos-da-missa.web.app**.

Para publicar uma nova versão após alterações:

```bash
ng build && firebase deploy
```

Na primeira vez em uma máquina nova:

```bash
npm install -g firebase-tools
firebase login          # abre o navegador para autenticar com a conta Google
ng build
firebase deploy
```

Os arquivos [firebase.json](firebase.json) e [.firebaserc](.firebaserc) já estão configurados no repositório.

## Sincronizar entre aparelhos depois (opcional)

Hoje a base é local (IndexedDB). Quando quiser ver as mesmas cifras em todos os
dispositivos, o ponto de extensão é o `DbService`: dá para espelhar as tabelas no
**Firestore** ou **Supabase** sem reescrever os componentes (eles dependem só dos
services). Enquanto isso, o **export/import de JSON** na tela inicial resolve a
transferência manual.

## Sobre o conteúdo das cifras

As músicas que vêm no app são **exemplos com letra original** apenas para demonstrar
o layout. Cadastre as suas próprias versões. Letras de músicas têm direitos autorais —
o app não baixa nem copia cifras de outros sites; ele organiza as que você inserir.
