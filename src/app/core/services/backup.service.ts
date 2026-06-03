import { Injectable, inject } from '@angular/core';
import {
  CollectionReference,
  addDoc,
  collection,
  getDocs,
  writeBatch,
} from '@angular/fire/firestore';
import { DbService } from './db.service';
import { Category } from '../models/category.model';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class BackupService {
  private db = inject(DbService);

  async export(): Promise<void> {
    const uid = this.db.uid;
    if (!uid) throw new Error('Não autenticado');

    const [catsSnap, songsSnap] = await Promise.all([
      getDocs(collection(this.db.firestoreInstance, `users/${uid}/categories`)),
      getDocs(collection(this.db.firestoreInstance, `users/${uid}/songs`)),
    ]);

    const data = {
      app: 'cantos-da-missa',
      version: 2,
      exportedAt: new Date().toISOString(),
      categories: catsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
      songs: songsSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
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
    const uid = this.db.uid;
    if (!uid) throw new Error('Não autenticado');

    const data = JSON.parse(await file.text());
    if (data.app !== 'cantos-da-missa') throw new Error('Arquivo inválido.');

    if (replace) {
      const [catsSnap, songsSnap] = await Promise.all([
        getDocs(collection(this.db.firestoreInstance, `users/${uid}/categories`)),
        getDocs(collection(this.db.firestoreInstance, `users/${uid}/songs`)),
      ]);
      const batch = writeBatch(this.db.firestoreInstance);
      catsSnap.docs.forEach((d) => batch.delete(d.ref));
      songsSnap.docs.forEach((d) => batch.delete(d.ref));
      await batch.commit();
    }

    const categoriesCol = collection(
      this.db.firestoreInstance, `users/${uid}/categories`,
    ) as CollectionReference<Omit<Category, 'id'>>;

    const songsCol = collection(
      this.db.firestoreInstance, `users/${uid}/songs`,
    ) as CollectionReference<Omit<Song, 'id'>>;

    if (Array.isArray(data.categories)) {
      await Promise.all(
        data.categories.map(({ id: _id, ...cat }: Category) => addDoc(categoriesCol, cat)),
      );
    }
    if (Array.isArray(data.songs)) {
      await Promise.all(
        data.songs.map(({ id: _id, ...song }: Song) => addDoc(songsCol, song)),
      );
    }
  }
}
