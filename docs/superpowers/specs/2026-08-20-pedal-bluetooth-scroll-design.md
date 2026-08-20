# Pedal Bluetooth (M-Vave Cube Turner Pro) — rolagem manual da cifra em playlist-play

Data: 2026-08-20

## Problema

Durante a missa, o músico segura o instrumento e não pode tocar a tela para rolar a cifra. O pedal M-Vave Cube Turner Pro (giro de página sem fio) resolve isso fisicamente, mas o app não reage a ele hoje.

O pedal é um dispositivo Bluetooth HID: parea como teclado externo no sistema operacional (não usa Web Bluetooth/GATT, que o navegador bloqueia para HID por segurança). Ele tem uma chave física de 7 marchas que define quais teclas cada um dos dois botões envia — marchas 1 a 3 enviam pares de teclas de navegação padrão (`ArrowLeft`/`ArrowRight`, `ArrowUp`/`ArrowDown`, `PageUp`/`PageDown`); marchas 6 e 7 simulam gestos de swipe (não geram `keydown`, fora do escopo). Como o app não escuta nenhuma tecla hoje, os toques do pedal não têm efeito nenhum.

## Decisões

- Escopo: `PlaylistPlayComponent` e `SongViewComponent` (mesma lógica duplicada nos dois, seguindo o padrão já existente de `scrolling`/`startScroll`/`stopScroll` duplicado entre eles). `song-list` fica de fora.
- Comportamento: pedal **rola o texto da cifra aos poucos**, não troca de música. Cada aperto = um passo pequeno fixo, para o músico não se perder no texto.
- Cobre marchas 1, 2 e 3 do pedal ao mesmo tempo (não é preciso escolher a marcha certa): `ArrowUp`/`ArrowLeft`/`PageUp` rolam para cima; `ArrowDown`/`ArrowRight`/`PageDown` rolam para baixo.
- Se o auto-scroll (`toggleScroll`) estiver ativo, o pedal o interrompe antes de aplicar o passo manual — mesmo padrão já usado por `prev()`/`next()`.
- Ignora o evento se o foco estiver em `input`, `select` ou `textarea` (ex.: campo do slider de velocidade), para não quebrar o uso normal desses controles com teclado real.

## Implementação

Mesmo trecho de código em `playlist-play.component.ts` e `song-view.component.ts`, sem serviço novo (não extraído para util compartilhado — YAGNI, só 2 usos):

- Constante `PEDAL_SCROLL_STEP = 120` (px).
- `@HostListener('window:keydown', ['$event'])` novo método `onPedalKey(event: KeyboardEvent)`:
  - Se `event.target` for `INPUT`, `SELECT` ou `TEXTAREA`, retorna sem fazer nada.
  - Mapa de teclas para direção:
    ```ts
    const UP_KEYS = ['ArrowUp', 'ArrowLeft', 'PageUp'];
    const DOWN_KEYS = ['ArrowDown', 'ArrowRight', 'PageDown'];
    ```
  - Se `event.key` não estiver em nenhum dos dois conjuntos, retorna sem fazer nada (não intercepta teclas fora desse escopo).
  - Caso contrário: `event.preventDefault()`, `this.stopScroll()` (interrompe auto-scroll se estiver rolando), e `window.scrollBy({ top: UP ? -PEDAL_SCROLL_STEP : PEDAL_SCROLL_STEP, behavior: 'smooth' })`.
- `@HostListener` é limpo automaticamente pelo Angular no destroy do componente — não precisa entrar no `ngOnDestroy()` existente.

Nenhuma mudança em `song-view`, `song-list`, `firestore.rules`, HTML ou CSS.

## Testando

Sem o pedal físico em mãos: simular com teclado real (as teclas mapeadas — setas e Page Up/Down — já existem em qualquer teclado). Abrir uma playlist com música longa em `ng serve`, apertar as teclas mapeadas e conferir:
- Rolagem em passos pequenos, sem pular a tela inteira.
- Foco no slider de velocidade (`input[type=range]`) não é afetado pelas setas.
- Auto-scroll ativo é interrompido ao usar o pedal.

Ao testar com o pedal físico depois de parear via Bluetooth do sistema, confirmar em qual marcha (1, 2 ou 3) os toques realmente chegam como as teclas esperadas — o comportamento do app já cobre as três.

## Fora de escopo

- `song-list` (rolagem da lista de músicas de uma categoria).
- Troca de música via pedal (marcha 5, media prev/next) — pedido original mudou para rolagem de cifra, não troca de música.
- Suporte a marchas 6/7 (swipe simulado) — não gera `keydown`, exigiria outra abordagem (touch events) e não foi pedido.
- Preferência configurável de tamanho do passo de rolagem (fixo em 120px por decisão do usuário).
- Web Bluetooth API / MIDI — descartados porque HID padrão via pareamento do SO já resolve com menos código.
