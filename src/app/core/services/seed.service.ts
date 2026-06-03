import { Injectable, inject } from '@angular/core';
import { CollectionReference, addDoc, collection, getDocs } from '@angular/fire/firestore';
import { DbService } from './db.service';
import { Category } from '../models/category.model';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class SeedService {
  private db = inject(DbService);

  async ensureSeed(): Promise<void> {
    const uid = this.db.uid;
    if (!uid) return;

    const snap = await getDocs(collection(this.db.firestoreInstance, `users/${uid}/categories`));
    if (snap.size > 0) return;

    const defaults: Omit<Category, 'id'>[] = [
      { name: 'Entrada',         icon: 'door_open',          order: 0, system: true },
      { name: 'Ato Penitencial', icon: 'self_improvement',   order: 1, system: true },
      { name: 'Glória',          icon: 'auto_awesome',       order: 2, system: true },
      { name: 'Aclamação',       icon: 'menu_book',          order: 3, system: true },
      { name: 'Ofertório',       icon: 'redeem',             order: 4, system: true },
      { name: 'Comunhão',        icon: 'bakery_dining',      order: 5, system: true },
      { name: 'Pós-Comunhão',    icon: 'volunteer_activism', order: 6, system: true },
      { name: 'Canto Final',     icon: 'waving_hand',        order: 7, system: true },
      { name: 'Especiais',       icon: 'star',               order: 8, system: true },
    ];

    const categoriesCol = collection(
      this.db.firestoreInstance, `users/${uid}/categories`,
    ) as CollectionReference<Omit<Category, 'id'>>;

    const ids = await Promise.all(defaults.map((cat) => addDoc(categoriesCol, cat).then((r) => r.id)));

    const now = Date.now();
    const songsCol = collection(
      this.db.firestoreInstance, `users/${uid}/songs`,
    ) as CollectionReference<Omit<Song, 'id'>>;

    await Promise.all([
      addDoc(songsCol, {
        categoryId: ids[0],
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
      }),
      addDoc(songsCol, {
        categoryId: ids[5],
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
      }),
    ]);
  }
}
