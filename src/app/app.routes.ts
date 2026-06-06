import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'cantor-acesso',
    loadComponent: () =>
      import('./features/cantor-access/cantor-access.component').then((m) => m.CantorAccessComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
  },
  {
    path: 'playlists',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/playlists/playlists.component').then((m) => m.PlaylistsComponent),
  },
  {
    path: 'playlists/nova',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./features/playlist-edit/playlist-edit.component').then((m) => m.PlaylistEditComponent),
  },
  {
    path: 'playlists/:id/editar',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./features/playlist-edit/playlist-edit.component').then((m) => m.PlaylistEditComponent),
  },
  {
    path: 'playlists/:id/tocar',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/playlist-play/playlist-play.component').then((m) => m.PlaylistPlayComponent),
  },
  {
    path: 'categoria/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/song-list/song-list.component').then((m) => m.SongListComponent),
  },
  {
    path: 'musica/nova/:categoryId',
    canActivate: [authGuard, roleGuard],
    loadComponent: () =>
      import('./features/song-edit/song-edit.component').then((m) => m.SongEditComponent),
  },
  {
    path: 'musica/:id/editar',
    canActivate: [authGuard, roleGuard],
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
