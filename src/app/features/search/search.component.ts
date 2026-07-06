import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { SongService } from '../../core/services/song.service';
import { CategoryService } from '../../core/services/category.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { Song } from '../../core/models/song.model';
import { normalize } from '../../shared/utils/normalize';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './search.component.html',
  styleUrl: './search.component.scss',
})
export class SearchComponent {
  private songService = inject(SongService);
  private categoryService = inject(CategoryService);

  private allSongs = toSignal(this.songService.all$(), { initialValue: [] as Song[] });

  private categoryName = computed(() => {
    const map = new Map(this.categoryService.categories().map((c) => [c.id, c.name]));
    return (categoryId: string) => map.get(categoryId) ?? '';
  });

  query = signal('');

  results = computed(() => {
    const q = normalize(this.query().trim());
    if (!q) return [];
    const name = this.categoryName();
    return this.allSongs()
      .filter((s) => normalize(s.title).includes(q) || normalize(s.author ?? '').includes(q))
      .map((s) => ({ song: s, categoryName: name(s.categoryId) }))
      .sort((a, b) => a.song.title.localeCompare(b.song.title));
  });
}
