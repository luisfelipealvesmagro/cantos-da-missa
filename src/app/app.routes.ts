import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/categories/categories.component').then((m) => m.CategoriesComponent),
  },
  {
    path: 'categoria/:id',
    loadComponent: () =>
      import('./features/song-list/song-list.component').then((m) => m.SongListComponent),
  },
  {
    path: 'musica/nova/:categoryId',
    loadComponent: () =>
      import('./features/song-edit/song-edit.component').then((m) => m.SongEditComponent),
  },
  {
    path: 'musica/:id/editar',
    loadComponent: () =>
      import('./features/song-edit/song-edit.component').then((m) => m.SongEditComponent),
  },
  {
    path: 'musica/:id',
    loadComponent: () =>
      import('./features/song-view/song-view.component').then((m) => m.SongViewComponent),
  },
  { path: '**', redirectTo: '' },
];
