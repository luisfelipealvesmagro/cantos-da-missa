import { Injectable, computed, inject } from '@angular/core';
import { CollectionReference, Firestore, collection } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { Category } from '../models/category.model';
import { Song } from '../models/song.model';

/** Centraliza as referências às coleções do Firestore para o usuário autenticado. */
@Injectable({ providedIn: 'root' })
export class DbService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  readonly categoriesCol = computed<CollectionReference<Category> | null>(() => {
    const uid = this.auth.uid();
    if (!uid) return null;
    return collection(this.firestore, `users/${uid}/categories`) as CollectionReference<Category>;
  });

  readonly songsCol = computed<CollectionReference<Song> | null>(() => {
    const uid = this.auth.uid();
    if (!uid) return null;
    return collection(this.firestore, `users/${uid}/songs`) as CollectionReference<Song>;
  });

  docRef(path: string) {
    return collection(this.firestore, path);
  }

  get firestoreInstance() {
    return this.firestore;
  }

  get uid() {
    return this.auth.uid();
  }
}
