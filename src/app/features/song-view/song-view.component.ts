import { ChangeDetectionStrategy, Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SongService } from '../../core/services/song.service';
import { TransposeService } from '../../core/services/transpose.service';
import { ChordSheetComponent } from '../../shared/chord-sheet/chord-sheet.component';
import { IconComponent } from '../../shared/icon/icon.component';
import { Song } from '../../core/models/song.model';

@Component({
  selector: 'app-song-view',
  standalone: true,
  imports: [RouterLink, ChordSheetComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-view.component.html',
  styleUrl: './song-view.component.scss',
})
export class SongViewComponent implements OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private songService = inject(SongService);
  private tp = inject(TransposeService);

  song = signal<Song | undefined>(undefined);
  steps = signal(0);
  capo = signal(0);
  fontScale = signal(1);

  keys = this.tp.keys;
  currentKey = computed(() => {
    const s = this.song();
    return s ? this.tp.transposeChord(s.originalKey, this.steps()) : '';
  });

  // auto-scroll
  scrolling = signal(false);
  speed = signal(3);
  private rafId = 0;
  private acc = 0;

  constructor() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
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
  fontUp() { this.fontScale.update((v) => Math.min(1.8, +(v + 0.1).toFixed(1))); }
  fontDown() { this.fontScale.update((v) => Math.max(0.7, +(v - 0.1).toFixed(1))); }

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

  async deleteSong() {
    const s = this.song();
    if (s && confirm(`Excluir "${s.title}"?`)) {
      await this.songService.remove(s.id!);
      this.router.navigate(['/categoria', s.categoryId]);
    }
  }

  ngOnDestroy() { this.stopScroll(); }
}
