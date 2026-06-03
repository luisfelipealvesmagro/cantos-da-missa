import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { map } from 'rxjs/operators';
import { SongService } from '../../core/services/song.service';
import { CategoryService } from '../../core/services/category.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { Song } from '../../core/models/song.model';

@Component({
  selector: 'app-song-list',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-list.component.html',
  styleUrl: './song-list.component.scss',
})
export class SongListComponent {
  private route = inject(ActivatedRoute);
  private songService = inject(SongService);
  readonly categoryService = inject(CategoryService);

  categoryId = toSignal(this.route.paramMap.pipe(map((p) => Number(p.get('id')))), { initialValue: 0 });

  category = toSignal(
    this.route.paramMap.pipe(switchMap((p) => this.categoryService.get(Number(p.get('id'))))),
    { initialValue: undefined }
  );

  private songs = toSignal(
    this.route.paramMap.pipe(switchMap((p) => this.songService.byCategory$(Number(p.get('id'))))),
    { initialValue: [] }
  );

  query = signal('');
  filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.songs();
    if (!q) return list;
    return list.filter((s) =>
      s.title.toLowerCase().includes(q) || (s.author ?? '').toLowerCase().includes(q));
  });

  otherCategories = computed(() =>
    this.categoryService.categories().filter(c => c.id !== this.categoryId())
  );

  activeCloneId = signal<number | null>(null);
  clonedMsg = signal('');

  toggleClone(songId: number) {
    this.activeCloneId.set(this.activeCloneId() === songId ? null : songId);
  }

  async cloneToCategory(song: Song, targetCategoryId: number, catName: string) {
    await this.songService.clone(song.id!, targetCategoryId);
    this.activeCloneId.set(null);
    this.clonedMsg.set(`Clonado para "${catName}"`);
    setTimeout(() => this.clonedMsg.set(''), 2500);
  }
}
