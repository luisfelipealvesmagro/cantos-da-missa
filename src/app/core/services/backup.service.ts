import { Injectable, inject } from '@angular/core';
import { DbService } from './db.service';

/** Exporta/importa toda a base como JSON — backup e transferência manual entre aparelhos. */
@Injectable({ providedIn: 'root' })
export class BackupService {
  private db = inject(DbService);

  async export(): Promise<void> {
    const data = {
      app: 'cantos-da-missa', version: 1, exportedAt: new Date().toISOString(),
      categories: await this.db.categories.toArray(),
      songs: await this.db.songs.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cantos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async import(file: File, replace = false): Promise<void> {
    const data = JSON.parse(await file.text());
    if (data.app !== 'cantos-da-missa') throw new Error('Arquivo inválido.');
    await this.db.transaction('rw', this.db.categories, this.db.songs, async () => {
      if (replace) { await this.db.categories.clear(); await this.db.songs.clear(); }
      if (Array.isArray(data.categories)) await this.db.categories.bulkPut(data.categories);
      if (Array.isArray(data.songs)) await this.db.songs.bulkPut(data.songs);
    });
  }
}
