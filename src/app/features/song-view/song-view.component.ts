import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SongService } from '../../core/services/song.service';
import { TransposeService } from '../../core/services/transpose.service';
import { RoleService } from '../../core/services/role.service';
import { PreferencesService } from '../../core/services/preferences.service';
import { WakeLockService } from '../../core/services/wake-lock.service';
import { ChordSheetComponent } from '../../shared/chord-sheet/chord-sheet.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { VideoPlayerComponent } from '../../shared/video-player/video-player.component';
import { extractYoutubeId } from '../../shared/utils/youtube';
import { Song } from '../../core/models/song.model';

const PEDAL_SCROLL_STEP = 120;
const PEDAL_UP_KEYS = ['ArrowUp', 'ArrowLeft', 'PageUp'];
const PEDAL_DOWN_KEYS = ['ArrowDown', 'ArrowRight', 'PageDown'];

@Component({
  selector: 'app-song-view',
  standalone: true,
  imports: [RouterLink, ChordSheetComponent, IconComponent, VideoPlayerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private songService = inject(SongService);
  private tp = inject(TransposeService);
  protected role = inject(RoleService);
  protected prefs = inject(PreferencesService);
  private wakeLock = inject(WakeLockService);

  song = signal<Song | undefined>(undefined);
  steps = signal(0);
  capo = signal(0);
  showVideo = signal(false);
  get fontScale() { return this.prefs.fontScale; }

  keys = this.tp.keys;
  currentKey = computed(() => {
    const s = this.song();
    return s ? this.tp.transposeChord(s.originalKey, this.steps()) : '';
  });
  hasVideo = computed(() => !!extractYoutubeId(this.song()?.videoUrl ?? ''));

  scrolling = signal(false);
  speed = signal(3);
  private rafId = 0;
  private acc = 0;

  constructor() {
    this.wakeLock.acquire();
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.songService.get(id).then((s) => {
      this.song.set(s);
      if (s) this.capo.set(s.capo ?? 0);
    });
  }

  transposeUp() { this.steps.update((v) => v + 1); }
  transposeDown() { this.steps.update((v) => v - 1); }
  selectKey(key: string) {
    const s = this.song();
    if (s) this.steps.set(this.tp.semitonesBetween(s.originalKey, key));
  }
  capoUp() { this.capo.update((v) => Math.min(11, v + 1)); }
  capoDown() { this.capo.update((v) => Math.max(0, v - 1)); }
  fontUp() { this.prefs.fontUp(); }
  fontDown() { this.prefs.fontDown(); }

  toggleScroll() {
    this.scrolling() ? this.stopScroll() : this.startScroll();
  }
  private startScroll() {
    this.scrolling.set(true);
    const step = () => {
      this.acc += this.speed() / 18;
      if (this.acc >= 1) {
        window.scrollBy(0, Math.floor(this.acc));
        this.acc -= Math.floor(this.acc);
      }
      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 1;
      if (atBottom) { this.stopScroll(); return; }
      this.rafId = requestAnimationFrame(step);
    };
    this.rafId = requestAnimationFrame(step);
  }
  private stopScroll() {
    this.scrolling.set(false);
    cancelAnimationFrame(this.rafId);
  }

  @HostListener('window:keydown', ['$event'])
  onPedalKey(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(target?.tagName)) return;

    const isUp = PEDAL_UP_KEYS.includes(event.key);
    const isDown = PEDAL_DOWN_KEYS.includes(event.key);
    if (!isUp && !isDown) return;

    event.preventDefault();
    this.stopScroll();
    window.scrollBy({ top: isUp ? -PEDAL_SCROLL_STEP : PEDAL_SCROLL_STEP, behavior: 'smooth' });
  }

  async deleteSong() {
    const s = this.song();
    if (s && confirm(`Excluir "${s.title}"?`)) {
      await this.songService.remove(s.id!);
      this.router.navigate(['/categoria', s.categoryId]);
    }
  }

  ngOnDestroy() { this.stopScroll(); this.wakeLock.release(); }
}
