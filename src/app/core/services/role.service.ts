import { Injectable, computed, effect, inject } from '@angular/core';
import { DocumentReference, Firestore, arrayRemove, arrayUnion, doc, docSnapshots, setDoc, updateDoc } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { NEVER } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

interface AppConfig {
  musicoUid: string;
  cantorEmails: string[];
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private configRef = doc(this.firestore, 'app/config') as DocumentReference<AppConfig>;

  // Músico é determinado pelo e-mail fixo — sem esperar nenhuma leitura do Firestore
  readonly isMusico = computed(() =>
    this.auth.email()?.toLowerCase() === environment.musicoEmail.toLowerCase()
  );

  // undefined = carregando; null = config não existe; AppConfig = carregado
  // Usado apenas para cantores (músico não depende disto)
  private snap = toSignal(
    docSnapshots(this.configRef).pipe(
      map(s => s.exists() ? (s.data() as AppConfig) : null),
      catchError(() => NEVER)
    )
  );

  readonly isCantor = computed(() => {
    if (this.isMusico()) return false;
    const snap = this.snap();
    const email = this.auth.email();
    if (!snap || !email) return false;
    return snap.cantorEmails?.includes(email.toLowerCase()) ?? false;
  });

  readonly hasAccess = computed(() => this.isMusico() || this.isCantor());

  readonly isReady = computed(() => {
    if (!this.auth.uid()) return true;
    if (this.isMusico()) return true; // músico nunca precisa esperar Firestore
    return this.snap() !== undefined; // cantores aguardam app/config
  });

  // UID de quem os dados devem ser lidos (músico = próprio; cantor = UID do músico)
  readonly effectiveUid = computed(() => {
    const uid = this.auth.uid();
    if (!uid) return null;
    if (this.isMusico()) return uid;
    const snap = this.snap();
    if (!snap) return null;
    return snap.musicoUid;
  });

  readonly cantorEmails = computed(() => this.snap()?.cantorEmails ?? []);

  constructor() {
    // Músico garante que app/config existe e tem o seu UID correto
    effect(() => {
      const uid = this.auth.uid();
      if (!uid || !this.isMusico()) return;
      const snap = this.snap();
      if (snap === undefined) return; // aguardando leitura
      if (snap === null) {
        setDoc(this.configRef, { musicoUid: uid, cantorEmails: [] }).catch(() => {});
      } else if (snap.musicoUid !== uid) {
        updateDoc(this.configRef, { musicoUid: uid }).catch(() => {});
      }
    });
  }

  async addCantorEmail(email: string) {
    await updateDoc(this.configRef, { cantorEmails: arrayUnion(email.toLowerCase().trim()) });
  }

  async removeCantorEmail(email: string) {
    await updateDoc(this.configRef, { cantorEmails: arrayRemove(email) });
  }
}
