import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { PlaylistService } from '../../core/services/playlist.service';
import { SongService } from '../../core/services/song.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { Song } from '../../core/models/song.model';

@Component({
  selector: 'app-playlist-edit',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playlist-edit.component.html',
  styleUrl: './playlist-edit.component.scss',
})
export class PlaylistEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playlistService = inject(PlaylistService);
  private songService = inject(SongService);

  private allSongs = toSignal(this.songService.all$(), { initialValue: [] as Song[] });

  editingId = signal<string | null>(null);
  name = signal('');
  songIds = signal<string[]>([]);
  query = signal('');

  isNew = computed(() => this.editingId() === null);

  selectedSongs = computed(() =>
    this.songIds()
      .map((id) => this.allSongs().find((s) => s.id === id))
      .filter((s): s is Song => !!s),
  );

  availableSongs = computed(() => {
    const ids = new Set(this.songIds());
    const q = this.query().trim().toLowerCase();
    return this.allSongs()
      .filter((s) => !ids.has(s.id!))
      .filter((s) => !q || s.title.toLowerCase().includes(q) || (s.author ?? '').toLowerCase().includes(q));
  });

  constructor() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.playlistService.get(id).then((pl) => {
        if (!pl) return;
        this.editingId.set(pl.id!);
        this.name.set(pl.name);
        this.songIds.set([...pl.songIds]);
      });
    }
  }

  addSong(song: Song) {
    this.songIds.update((ids) => [...ids, song.id!]);
  }

  removeSong(index: number) {
    this.songIds.update((ids) => ids.filter((_, i) => i !== index));
  }

  moveUp(index: number) {
    if (index === 0) return;
    this.songIds.update((ids) => {
      const arr = [...ids];
      [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
      return arr;
    });
  }

  moveDown(index: number) {
    this.songIds.update((ids) => {
      if (index >= ids.length - 1) return ids;
      const arr = [...ids];
      [arr[index], arr[index + 1]] = [arr[index + 1], arr[index]];
      return arr;
    });
  }

  async save() {
    const name = this.name().trim();
    if (!name) return;
    if (this.isNew()) {
      const id = await this.playlistService.add(name);
      await this.playlistService.update(id, { songIds: this.songIds() });
      this.router.navigate(['/playlists']);
    } else {
      await this.playlistService.update(this.editingId()!, { name, songIds: this.songIds() });
      this.router.navigate(['/playlists']);
    }
  }

  cancel() { this.router.navigate(['/playlists']); }
}
