import { Component, OnInit, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
import { RoleService } from './core/services/role.service';
import { IconComponent } from './shared/icon/icon.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, IconComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  protected theme = inject(ThemeService);
  protected auth = inject(AuthService);
  protected role = inject(RoleService);
  private router = inject(Router);

  constructor() {
    // Redireciona para login se não autenticado, ou para home se já logado na tela de login
    effect(() => {
      if (!this.auth.isReady()) return;
      if (!this.auth.uid()) {
        this.router.navigate(['/login']);
      } else if (this.router.url === '/login') {
        this.router.navigate(['/']);
      }
    });

    // Redireciona para tela de acesso pendente se autenticado mas sem permissão
    effect(() => {
      if (!this.role.isReady()) return;
      const uid = this.auth.uid();
      if (uid && !this.role.hasAccess()) {
        this.router.navigate(['/cantor-acesso']);
      }
    });
  }

  ngOnInit(): void {
    this.theme.init();
  }
}
