import { Injectable, computed, inject } from '@angular/core';
import { CollectionReference, Firestore, collection } from '@angular/fire/firestore';
import { RoleService } from './role.service';
import { Category } from '../models/category.model';
import { Song } from '../models/song.model';

/** Centraliza as referências às coleções do Firestore.
 *  Sempre aponta para os dados do músico — cantores lêem do mesmo UID. */
@Injectable({ providedIn: 'root' })
export class DbService {
  private firestore = inject(Firestore);
  private role = inject(RoleService);

  readonly categoriesCol = computed<CollectionReference<Category> | null>(() => {
    const uid = this.role.effectiveUid();
    if (!uid) return null;
    return collection(this.firestore, `users/${uid}/categories`) as CollectionReference<Category>;
  });

  readonly songsCol = computed<CollectionReference<Song> | null>(() => {
    const uid = this.role.effectiveUid();
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
    return this.role.effectiveUid();
  }
}
