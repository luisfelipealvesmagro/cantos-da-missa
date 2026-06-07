import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlaylistService } from '../../core/services/playlist.service';
import { SongService } from '../../core/services/song.service';
import { TransposeService } from '../../core/services/transpose.service';
import { RoleService } from '../../core/services/role.service';
import { WakeLockService } from '../../core/services/wake-lock.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { ChordSheetComponent } from '../../shared/chord-sheet/chord-sheet.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { Song } from '../../core/models/song.model';
import { Playlist } from '../../core/models/playlist.model';

@Component({
  selector: 'app-playlist-play',
  standalone: true,
  imports: [ChordSheetComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './playlist-play.component.html',
  styleUrl: './playlist-play.component.scss',
})
export class PlaylistPlayComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playlistService = inject(PlaylistService);
  private songService = inject(SongService);
  private tp = inject(TransposeService);
  private wakeLock = inject(WakeLockService);
  protected role = inject(RoleService);
  protected prefs = inject(PreferencesService);

  playlist = signal<Playlist | undefined>(undefined);
  songs = signal<Song[]>([]);
  index = signal(0);
  steps = signal(0);
  capo = signal(0);
  get fontScale() { return this.prefs.fontScale; }
  showControls = signal(true);
  showSongPicker = signal(false);

  keys = this.tp.keys;

  currentSong = computed(() => this.songs()[this.index()]);
  isFirst = computed(() => this.index() === 0);
  isLast = computed(() => this.index() === this.songs().length - 1);
  currentKey = computed(() => {
    const s = this.currentSong();
    return s ? this.tp.transposeChord(s.originalKey, this.steps()) : '';
  });

  // auto-scroll
  scrolling = signal(false);
  speed = signal(3);
  private rafId = 0;
  private acc = 0;

  constructor() {
    this.wakeLock.acquire();
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.playlistService.get(id).then(async (pl) => {
      if (!pl) { this.router.navigate(['/playlists']); return; }
      this.playlist.set(pl);
      const loaded = await Promise.all(pl.songIds.map((sid) => this.songService.get(sid)));
      this.songs.set(loaded.filter((s): s is Song => !!s));
      const first = this.songs()[0];
      if (first) this.capo.set(first.capo ?? 0);
    });
  }

  prev() {
    if (this.isFirst()) return;
    this.stopScroll();
    this.index.update((i) => i - 1);
    this.resetControls();
  }

  next() {
    if (this.isLast()) return;
    this.stopScroll();
    this.index.update((i) => i + 1);
    this.resetControls();
  }

  jumpTo(i: number) {
    this.stopScroll();
    this.index.set(i);
    this.resetControls();
    this.showSongPicker.set(false);
  }

  private resetControls() {
    this.steps.set(0);
    const s = this.currentSong();
    this.capo.set(s?.capo ?? 0);
    window.scrollTo(0, 0);
  }

  transposeUp()   { this.steps.update((v) => v + 1); }
  transposeDown() { this.steps.update((v) => v - 1); }
  selectKey(key: string) {
    const s = this.currentSong();
    if (s) this.steps.set(this.tp.semitonesBetween(s.originalKey, key));
  }
  capoUp()   { this.capo.update((v) => Math.min(11, v + 1)); }
  capoDown() { this.capo.update((v) => Math.max(0, v - 1)); }
  fontUp()   { this.prefs.fontUp(); }
  fontDown() { this.prefs.fontDown(); }

  toggleScroll() { this.scrolling() ? this.stopScroll() : this.startScroll(); }
  private startScroll() {
    this.scrolling.set(true);
    const step = () => {
      this.acc += this.speed() / 18;
      if (this.acc >= 1) { window.scrollBy(0, Math.floor(this.acc)); this.acc -= Math.floor(this.acc); }
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 1;
      if (atBottom) { this.stopScroll(); return; }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }
  private stopScroll() { this.scrolling.set(false); cancelAnimationFrame(this.rafId); }

  back() { this.router.navigate(['/playlists']); }

  ngOnDestroy() { this.stopScroll(); this.wakeLock.release(); }
}
