import { Injectable, inject } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  CollectionReference,
  addDoc,
  collection,
  collectionData,
  deleteDoc,
  doc,
  getDoc,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { DbService } from './db.service';
import { Song } from '../models/song.model';

@Injectable({ providedIn: 'root' })
export class SongService {
  private db = inject(DbService);
  private auth = inject(AuthService);

  byCategory$(categoryId: string): Observable<Song[]> {
    return toObservable(this.auth.uid).pipe(
      switchMap((uid) => {
        if (!uid) return of([] as Song[]);
        return collectionData<Song>(
          query(
            collection(this.db.firestoreInstance, `users/${uid}/songs`) as CollectionReference<Song>,
            where('categoryId', '==', categoryId),
            orderBy('title'),
          ),
          { idField: 'id' },
        );
      }),
    );
  }

  all$(): Observable<Song[]> {
    return toObservable(this.auth.uid).pipe(
      switchMap((uid) => {
        if (!uid) return of([] as Song[]);
        return collectionData<Song>(
          collection(this.db.firestoreInstance, `users/${uid}/songs`) as CollectionReference<Song>,
          { idField: 'id' },
        );
      }),
    );
  }

  async get(id: string): Promise<Song | undefined> {
    const uid = this.auth.uid();
    if (!uid) return undefined;
    const snap = await getDoc(doc(this.db.firestoreInstance, `users/${uid}/songs/${id}`));
    return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Song, 'id'>) } : undefined;
  }

  async add(song: Omit<Song, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    const now = Date.now();
    const ref = await addDoc(
      collection(this.db.firestoreInstance, `users/${uid}/songs`) as CollectionReference<Omit<Song, 'id'>>,
      { ...song, createdAt: now, updatedAt: now },
    );
    return ref.id;
  }

  update(id: string, changes: Partial<Omit<Song, 'id'>>) {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    return updateDoc(doc(this.db.firestoreInstance, `users/${uid}/songs/${id}`), {
      ...changes,
      updatedAt: Date.now(),
    });
  }

  remove(id: string) {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    return deleteDoc(doc(this.db.firestoreInstance, `users/${uid}/songs/${id}`));
  }

  async clone(songId: string, targetCategoryId: string): Promise<string> {
    const song = await this.get(songId);
    if (!song) throw new Error('Música não encontrada');
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    const now = Date.now();
    const ref = await addDoc(
      collection(this.db.firestoreInstance, `users/${uid}/songs`) as CollectionReference<Omit<Song, 'id'>>,
      {
        categoryId: targetCategoryId,
        title: song.title,
        author: song.author,
        originalKey: song.originalKey,
        capo: song.capo,
        body: song.body,
        createdAt: now,
        updatedAt: now,
      },
    );
    return ref.id;
  }
}
