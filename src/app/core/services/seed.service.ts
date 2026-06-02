import { Injectable, inject } from '@angular/core';
import { DbService } from './db.service';
import { Category } from '../models/category.model';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private db = inject(DbService);

  /** Popula categorias padrão da missa (e um par de cifras de exemplo) na 1ª abertura. */
  async ensureSeed(): Promise<void> {
    const count = await this.db.categories.count();
    if (count > 0) return;

    const defaults: Category[] = [
      { name: 'Entrada',         icon: 'door_open',            order: 0, system: true },
      { name: 'Ato Penitencial', icon: 'self_improvement',     order: 1, system: true },
      { name: 'Glória',          icon: 'auto_awesome',         order: 2, system: true },
      { name: 'Aclamação',       icon: 'menu_book',            order: 3, system: true },
      { name: 'Ofertório',       icon: 'redeem',               order: 4, system: true },
      { name: 'Comunhão',        icon: 'bakery_dining',        order: 5, system: true },
      { name: 'Pós-Comunhão',    icon: 'volunteer_activism',   order: 6, system: true },
      { name: 'Canto Final',     icon: 'waving_hand',          order: 7, system: true },
      { name: 'Especiais',       icon: 'star',                 order: 8, system: true },
    ];
    const ids = await this.db.categories.bulkAdd(defaults, { allKeys: true });
    const now = Date.now();

    // Cifras de EXEMPLO com letra original (substitua pelas suas versões).
    const demos: Song[] = [
      {
        categoryId: ids[0] as number,
        title: 'Vinde e Cantai (exemplo)',
        author: 'demonstração',
        originalKey: 'G',
        capo: 0,
        body:
`{c: Refrão}
[G]Vinde todos a can[C]tar,
[D]neste dia de lou[G]var.
[Em]Cristo nos con[C]vida a [G]vir,
[D]ao altar do seu a[G]mor.

{c: Estrofe}
[G]Abre as portas, cora[C]ção,
[D]entra em paz nesta can[G]ção.`,
        createdAt: now, updatedAt: now,
      },
      {
        categoryId: ids[5] as number,
        title: 'Pão da Vida (exemplo)',
        author: 'demonstração',
        originalKey: 'D',
        capo: 2,
        body:
`{c: Refrão}
[D]Pão da vida, fonte e [G]luz,
[A]vem morar em nós, Je[D]sus.
[Bm]No silêncio deste [G]altar,
[A]tua paz vem nos to[D]car.`,
        createdAt: now, updatedAt: now,
      },
    ];
    await this.db.songs.bulkAdd(demos);
  }
}
