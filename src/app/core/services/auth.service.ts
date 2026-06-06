import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, GoogleAuthProvider, signInWithPopup, signOut, user } from '@angular/fire/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);

  // undefined = Firebase ainda inicializando; null = deslogado; User = logado
  readonly user = toSignal(user(this.auth));
  readonly isReady = computed(() => this.user() !== undefined);
  readonly uid = computed(() => this.user()?.uid ?? null);
  readonly email = computed(() => this.user()?.email ?? null);
  readonly displayName = computed(() => this.user()?.displayName ?? null);
  readonly photoURL = computed(() => this.user()?.photoURL ?? null);

  signInWithGoogle() {
    return signInWithPopup(this.auth, new GoogleAuthProvider());
  }

  signOut() {
    return signOut(this.auth);
  }
}
