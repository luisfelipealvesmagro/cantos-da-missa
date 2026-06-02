import { Injectable, inject } from '@angular/core';
import { liveQuery } from 'dexie';
import { from, Observable } from 'rxjs';
import { DbService } from './db.service';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class SongService {
  private db = inject(DbService);

  /** Observable de músicas de uma categoria (para usar com toSignal nos componentes). */
  byCategory$(categoryId: number): Observable<Song[]> {
    return from(liveQuery(() =>
      this.db.songs.where('categoryId').equals(categoryId).sortBy('title')
    ));
  }

  /** Observable de todas as músicas (usado para contagens na home). */
  all$(): Observable<Song[]> {
    return from(liveQuery(() => this.db.songs.toArray()));
  }

  get(id: number) { return this.db.songs.get(id); }

  add(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    const now = Date.now();
    return this.db.songs.add({ ...song, createdAt: now, updatedAt: now });
  }

  update(id: number, changes: Partial<Song>) {
    return this.db.songs.update(id, { ...changes, updatedAt: Date.now() });
  }

  remove(id: number) { return this.db.songs.delete(id); }
}
