import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlaylistService } from '../../core/services/playlist.service';
import { RoleService } from '../../core/services/role.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { normalize } from '../../shared/utils/normalize';

@Component({
  selector: 'app-playlists',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playlists.component.html',
  styleUrl: './playlists.component.scss',
})
export class PlaylistsComponent {
  private playlistService = inject(PlaylistService);
  private router = inject(Router);
  protected role = inject(RoleService);

  playlists = toSignal(this.playlistService.all$(), { initialValue: [] });

  query = signal('');
  filtered = computed(() => {
    const q = normalize(this.query().trim());
    const list = this.playlists();
    if (!q) return list;
    return list.filter((pl) =>
      normalize(pl.name).includes(q) || normalize(pl.description ?? '').includes(q));
  });

  async remove(id: string, name: string) {
    if (confirm(`Excluir a playlist "${name}"?`)) {
      await this.playlistService.remove(id);
    }
  }

  async clone(id: string, name: string) {
    const newName = prompt('Nome da nova playlist:', `${name} (cópia)`)?.trim();
    if (!newName) return;
    const newId = await this.playlistService.duplicate(id, newName);
    this.router.navigate(['/playlists', newId, 'editar']);
  }
}
