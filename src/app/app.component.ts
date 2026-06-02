import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { ThemeService } from './core/services/theme.service';
import { SeedService } from './core/services/seed.service';
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
  private seed = inject(SeedService);

  ngOnInit(): void {
    this.theme.init();
    this.seed.ensureSeed();
  }
}
