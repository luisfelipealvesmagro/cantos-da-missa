# Melhorias no cadastro de categorias

Data: 2026-07-24

## Contexto

O cadastro/edição de categorias hoje vive inteiramente em `src/app/features/categories/` (`categories.component.ts`/`.html`), como formulário inline dentro da grade de categorias da tela inicial. O modelo de dados (`core/models/category.model.ts`) tem `{ id, name, icon, order, system? }`. Esta sessão de brainstorming revisou o fluxo atual e definiu um conjunto de melhorias focadas em segurança de dados, pequenas melhorias de UX e limpeza de código — sem introduzir cor, modal, ou limite de quantidade de categorias (avaliados e descartados nesta rodada).

## Escopo

1. Remover o campo `system` do modelo (não usado por nenhuma lógica hoje).
2. Bloquear a exclusão de categorias que ainda tenham músicas associadas.
3. Validar nome duplicado ao criar/editar categoria.
4. Extrair o formulário de nome+ícone (hoje duplicado entre os blocos de adicionar e editar) em um componente reutilizável.
5. Ampliar a lista de ícones com mais opções temáticas de igreja/liturgia.
6. Remover `CategoryService.swapOrder()` (código morto, sem chamadores).

Fora de escopo (avaliado e descartado): campo de cor, limite máximo de categorias, formulário em modal/diálogo (permanece inline), fluxo de "mover músicas para outra categoria" (substituído pelo bloqueio simples de exclusão).

## 1. Modelo de dados

Remover `system?: boolean` de `src/app/core/models/category.model.ts`:

```ts
export interface Category {
  id?: string;
  name: string;
  icon: string;
  order: number;
}
```

Remover `system: true` das 9 entradas padrão em `src/app/core/services/seed.service.ts:19-27`.

Documentos já existentes no Firestore podem manter o campo `system` gravado — Firestore é schemaless, o campo remanescente é inofensivo e não precisa de migração/limpeza retroativa.

## 2. Bloquear exclusão de categoria com músicas

`CategoryService.remove()` (`category.service.ts:86-99`) já consulta as músicas da categoria (`songsSnap`) antes de excluir. Mudança:

- Se `songsSnap.size > 0`, lançar `Error` com mensagem tipo `"Não é possível excluir: existem N música(s) nesta categoria."` (singular/plural conforme a contagem) e não prosseguir.
- Se `songsSnap.size === 0`, excluir apenas o documento da categoria — remove-se o laço de `batch.delete` sobre as músicas, já que nunca have músicas a apagar neste ponto.

Na UI, `deleteCategory()` (`categories.component.ts:86-91`) mantém o `confirm()` de segurança existente, mas a chamada a `categoryService.remove()` passa a estar em `try/catch`, mostrando a mensagem de erro via `alert()` — mesmo padrão já usado em `onImport()` (`categories.component.ts:113-124`) para erros de importação de backup.

## 3. Validação de nome duplicado

Comparação case-insensitive e com espaços ignorados: `name.trim().toLowerCase()` contra os nomes das categorias existentes (`categoryService.categories()`), excluindo a própria categoria quando em modo de edição.

Fica embutida no novo componente de formulário (seção 4): ao tentar salvar, se houver duplicata, mostra um erro inline abaixo do campo de nome (ex: `"Já existe uma categoria chamada "X"."`) e bloqueia o salvamento. Não é necessária nenhuma mudança no `CategoryService` além do signal `categories` já público — a validação é responsabilidade do componente de formulário, consistente com o restante do app (toda validação hoje é client-side, sem regras de schema no Firestore).

## 4. Componente de formulário reutilizável

Novo componente standalone `src/app/features/categories/category-form/category-form.component.ts` (+ `.html` + `.scss`), seguindo a convenção de nomes do projeto (pasta kebab-case, três arquivos com o mesmo nome base).

Interface:
- `@Input() initial?: Category` — presente em modo de edição (preenche nome/ícone iniciais e habilita a checagem de duplicado excluindo o próprio id); ausente em modo de criação.
- `@Output() save = new EventEmitter<{ name: string; icon: string }>()`
- `@Output() cancel = new EventEmitter<void>()`

Internamente mantém os signals de nome/ícone/erro de validação e a lista `iconOptions` (migrada de `categories.component.ts:43-50` para dentro deste componente, já que só é usada aqui).

`categories.component.html` substitui os dois blocos hoje quase idênticos (linhas 45-62 para editar, 68-83 para adicionar) por duas instâncias de `<app-category-form>`, escutando `(save)` e `(cancel)`. `categories.component.ts` remove os signals `newName`/`newIcon`/`editName`/`editIcon`/`iconOptions` e os métodos `saveCategory`/`saveEdit` passam a apenas chamar `categoryService.add()`/`update()` a partir do evento `save` emitido pelo formulário.

## 5. Ampliar ícones litúrgicos/de igreja

A lista atual (`iconOptions`, hoje dentro de `categories.component.ts:44-50`, migrando para o novo componente) já tem 22 ícones, vários temáticos (`chalice`, `church`, `self_improvement`, `volunteer_activism`, `water_drop`, `local_fire_department`, `crown`...). Candidatos a adicionar, sujeitos a verificação visual durante a implementação (nem todo nome do Material Symbols existe/renderiza como esperado):

- `handshake` — saudação da paz
- `auto_stories` — liturgia da palavra (distinto de `menu_book`, já usado para "Aclamação")
- `nights_stay` — vigília
- `egg_alt` — Páscoa

Qualquer ícone que não renderize corretamente (aparecer como texto em vez do símbolo) deve ser removido da lista final.

## 6. Remover código morto

Apagar `CategoryService.swapOrder()` (`category.service.ts:67-74`) — sem nenhum chamador na base de código (apenas `reorder()` é usado pelo drag-and-drop).

## Testes

O projeto não possui nenhum arquivo `*.spec.ts` hoje, apesar do `npm test` documentado no `CLAUDE.md`. Seguindo o padrão existente, a verificação será manual no navegador (`npm start`), cobrindo:

- Criar categoria com nome novo → sucesso.
- Tentar criar/editar categoria com nome duplicado (variando maiúsculas/minúsculas e espaços) → bloqueado com mensagem inline.
- Tentar excluir categoria com músicas → bloqueado com mensagem de erro.
- Excluir categoria vazia → sucesso.
- Drag-and-drop de reordenação continua funcionando após a extração do componente de formulário.
- Seed de categorias padrão continua criando as 9 categorias normalmente (sem o campo `system`).
