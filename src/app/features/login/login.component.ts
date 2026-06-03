import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  error = signal('');

  async signIn() {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.auth.signInWithGoogle();
      this.router.navigate(['/']);
    } catch {
      this.error.set('Não foi possível entrar. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }
}
