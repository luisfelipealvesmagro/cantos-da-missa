import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CategoryService } from '../../core/services/category.service';
import { SongService } from '../../core/services/song.service';
import { BackupService } from '../../core/services/backup.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent {
  private categoryService = inject(CategoryService);
  private songService = inject(SongService);
  private backup = inject(BackupService);

  categories = this.categoryService.categories;
  private allSongs = toSignal(this.songService.all$(), { initialValue: [] });
  counts = computed(() => {
    const m: Record<number, number | undefined> = {};
    for (const s of this.allSongs()) m[s.categoryId] = (m[s.categoryId] ?? 0) + 1;
    return m;
  });

  manage = signal(false);
  adding = signal(false);
  newName = signal('');
  newIcon = signal('music_note');
  iconOptions = ['music_note', 'church', 'star', 'favorite', 'self_improvement',
    'auto_awesome', 'menu_book', 'redeem', 'bakery_dining', 'waving_hand', 'celebration', 'spa'];

  async saveCategory() {
    const name = this.newName().trim();
    if (!name) return;
    await this.categoryService.add(name, this.newIcon());
    this.newName.set('');
    this.newIcon.set('music_note');
    this.adding.set(false);
  }

  async deleteCategory(id: number, name: string) {
    if (confirm(`Excluir "${name}" e todas as suas cifras?`)) {
      await this.categoryService.remove(id);
    }
  }

  exportData() { this.backup.export(); }

  async onImport(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    try {
      await this.backup.import(file, false);
      alert('Backup importado com sucesso.');
    } catch (e) {
      alert('Não foi possível importar: ' + (e as Error).message);
    }
    input.value = '';
  }
}
