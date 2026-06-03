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
} from '@angular/fire/firestore';
import { Observable, of, switchMap } from 'rxjs';
import { AuthService } from './auth.service';
import { DbService } from './db.service';
import { Playlist } from '../models/playlist.model';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  private db = inject(DbService);
  private auth = inject(AuthService);

  all$(): Observable<Playlist[]> {
    return toObservable(this.auth.uid).pipe(
      switchMap((uid) => {
        if (!uid) return of([] as Playlist[]);
        return collectionData<Playlist>(
          query(
            collection(this.db.firestoreInstance, `users/${uid}/playlists`) as CollectionReference<Playlist>,
            orderBy('createdAt', 'desc'),
          ),
          { idField: 'id' },
        );
      }),
    );
  }

  async get(id: string): Promise<Playlist | undefined> {
    const uid = this.auth.uid();
    if (!uid) return undefined;
    const snap = await getDoc(doc(this.db.firestoreInstance, `users/${uid}/playlists/${id}`));
    return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Playlist, 'id'>) } : undefined;
  }

  async add(name: string): Promise<string> {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    const now = Date.now();
    const ref = await addDoc(
      collection(this.db.firestoreInstance, `users/${uid}/playlists`) as CollectionReference<Omit<Playlist, 'id'>>,
      { name: name.trim(), songIds: [], createdAt: now, updatedAt: now },
    );
    return ref.id;
  }

  update(id: string, changes: Partial<Omit<Playlist, 'id'>>) {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    return updateDoc(doc(this.db.firestoreInstance, `users/${uid}/playlists/${id}`), {
      ...changes,
      updatedAt: Date.now(),
    });
  }

  remove(id: string) {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    return deleteDoc(doc(this.db.firestoreInstance, `users/${uid}/playlists/${id}`));
  }
}
