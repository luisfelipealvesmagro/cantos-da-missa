import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { liveQuery } from 'dexie';
import { from } from 'rxjs';
import { DbService } from './db.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private db = inject(DbService);

  readonly categories = toSignal(
    from(liveQuery(() => this.db.categories.orderBy('order').toArray())),
    { initialValue: [] as Category[] }
  );

  get(id: number) { return this.db.categories.get(id); }

  async add(name: string, icon = 'music_note'): Promise<number> {
    const order = (await this.db.categories.count());
    return this.db.categories.add({ name: name.trim(), icon, order });
  }

  update(id: number, changes: Partial<Category>) {
    return this.db.categories.update(id, changes);
  }

  async remove(id: number) {
    await this.db.songs.where('categoryId').equals(id).delete();
    await this.db.categories.delete(id);
  }

  countSongs(categoryId: number) {
    return this.db.songs.where('categoryId').equals(categoryId).count();
  }
}
