import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Category } from '../models/category.model';
import { Song } from '../models/song.model';

/**
 * Banco local em IndexedDB via Dexie. Toda a base vive no dispositivo.
 * Para sincronizar entre aparelhos depois, basta plugar Firestore/Supabase
 * aqui (ou usar o export/import de JSON do BackupService).
 */
@Injectable({ providedIn: 'root' })
export class DbService extends Dexie {
  categories!: Table<Category, number>;
  songs!: Table<Song, number>;

  constructor() {
    super('cantos-da-missa');
    this.version(1).stores({
      categories: '++id, order, name',
      songs: '++id, categoryId, title',
    });
  }
}
