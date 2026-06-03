import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlaylistService } from '../../core/services/playlist.service';
import { IconComponent } from '../../shared/icon/icon.component';

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

  playlists = toSignal(this.playlistService.all$(), { initialValue: [] });

  async remove(id: string, name: string) {
    if (confirm(`Excluir a playlist "${name}"?`)) {
      await this.playlistService.remove(id);
    }
  }
}
