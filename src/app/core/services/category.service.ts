import { Injectable, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import {
  CollectionReference,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from '@angular/fire/firestore';
import { of, switchMap } from 'rxjs';
import { collectionData } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { DbService } from './db.service';
import { Category } from '../models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private db = inject(DbService);
  private auth = inject(AuthService);

  readonly categories = toSignal(
    toObservable(this.db.effectiveUid).pipe(
      switchMap((uid) => {
        if (!uid) return of([] as Category[]);
        return collectionData<Category>(
          query(
            collection(this.db.firestoreInstance, `users/${uid}/categories`) as CollectionReference<Category>,
            orderBy('order'),
          ),
          { idField: 'id' },
        );
      }),
    ),
    { initialValue: [] as Category[] },
  );

  async get(id: string): Promise<Category | undefined> {
    const uid = this.db.uid;
    if (!uid) return undefined;
    const snap = await getDoc(doc(this.db.firestoreInstance, `users/${uid}/categories/${id}`));
    return snap.exists() ? { id: snap.id, ...(snap.data() as Omit<Category, 'id'>) } : undefined;
  }

  async add(name: string, icon = 'music_note'): Promise<string> {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    const order = this.categories().length;
    const ref = await addDoc(
      collection(this.db.firestoreInstance, `users/${uid}/categories`) as CollectionReference<Omit<Category, 'id'>>,
      { name: name.trim(), icon, order },
    );
    return ref.id;
  }

  update(id: string, changes: Partial<Omit<Category, 'id'>>) {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    return updateDoc(doc(this.db.firestoreInstance, `users/${uid}/categories/${id}`), changes);
  }

  async reorder(cats: Category[]) {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    const batch = writeBatch(this.db.firestoreInstance);
    cats.forEach((cat, i) =>
      batch.update(doc(this.db.firestoreInstance, `users/${uid}/categories/${cat.id}`), { order: i }),
    );
    return batch.commit();
  }

  async remove(id: string) {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Não autenticado');
    const songsSnap = await getDocs(
      query(
        collection(this.db.firestoreInstance, `users/${uid}/songs`),
        where('categoryId', '==', id),
      ),
    );
    if (songsSnap.size > 0) {
      const n = songsSnap.size;
      throw new Error(`Não é possível excluir: existem ${n} música${n === 1 ? '' : 's'} nesta categoria.`);
    }
    return deleteDoc(doc(this.db.firestoreInstance, `users/${uid}/categories/${id}`));
  }
}
