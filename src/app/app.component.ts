import { Component, OnInit, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';
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
  private router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.auth.isReady()) return;
      if (!this.auth.uid()) {
        this.router.navigate(['/login']);
      } else if (this.router.url === '/login') {
        this.router.navigate(['/']);
      }
    });
  }

  ngOnInit(): void {
    this.theme.init();
  }
}
