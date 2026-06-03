import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
  },
  {
    path: 'categoria/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/song-list/song-list.component').then((m) => m.SongListComponent),
  },
  {
    path: 'musica/nova/:categoryId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/song-edit/song-edit.component').then((m) => m.SongEditComponent),
  },
  {
    path: 'musica/:id/editar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/song-edit/song-edit.component').then((m) => m.SongEditComponent),
  },
  {
    path: 'musica/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/song-view/song-view.component').then((m) => m.SongViewComponent),
  },
  { path: '**', redirectTo: '' },
];
