import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkDragDrop, CdkDropList, CdkDrag, CdkDragHandle, moveItemInArray } from '@angular/cdk/drag-drop';
import { CategoryService } from '../../core/services/category.service';
import { SongService } from '../../core/services/song.service';
import { BackupService } from '../../core/services/backup.service';
import { SeedService } from '../../core/services/seed.service';
import { RoleService } from '../../core/services/role.service';
import { IconComponent } from '../../shared/icon/icon.component';
import { Category } from '../../core/models/category.model';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, IconComponent, CdkDropList, CdkDrag, CdkDragHandle],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
})
export class CategoriesComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private songService = inject(SongService);
  private backup = inject(BackupService);
  private seed = inject(SeedService);
  protected role = inject(RoleService);

  ngOnInit() { this.seed.ensureSeed(); }

  categories = this.categoryService.categories;
  private allSongs = toSignal(this.songService.all$(), { initialValue: [] });
  counts = computed(() => {
    const m: Record<string, number | undefined> = {};
    for (const s of this.allSongs()) m[s.categoryId] = (m[s.categoryId] ?? 0) + 1;
    return m;
  });
  totalSongs = computed(() => this.allSongs().length);

  manage = signal(false);
  adding = signal(false);
  newName = signal('');
  newIcon = signal('music_note');
  iconOptions = [
    'music_note', 'chalice', 'church', 'star', 'favorite',
    'self_improvement', 'auto_awesome', 'menu_book', 'redeem', 'bakery_dining',
    'waving_hand', 'celebration', 'spa',
    // litúrgicos adicionais
    'crown', 'water_drop', 'flare', 'wb_sunny', 'brightness_5',
    'local_fire_department', 'emoji_nature', 'volunteer_activism', 'mode_of_travel',
  ];

  editingId = signal<string | null>(null);
  editName = signal('');
  editIcon = signal('music_note');

  async saveCategory() {
    const name = this.newName().trim();
    if (!name) return;
    await this.categoryService.add(name, this.newIcon());
    this.newName.set('');
    this.newIcon.set('music_note');
    this.adding.set(false);
  }

  startEdit(cat: Category) {
    this.editingId.set(cat.id!);
    this.editName.set(cat.name);
    this.editIcon.set(cat.icon);
  }

  async saveEdit() {
    const name = this.editName().trim();
    if (!name || this.editingId() === null) return;
    await this.categoryService.update(this.editingId()!, { name, icon: this.editIcon() });
    this.editingId.set(null);
  }

  cancelEdit() { this.editingId.set(null); }

  drop(event: CdkDragDrop<Category[]>) {
    const cats = [...this.categories()];
    moveItemInArray(cats, event.previousIndex, event.currentIndex);
    this.categoryService.reorder(cats);
  }

  async deleteCategory(id: string, name: string) {
    if (confirm(`Excluir "${name}" e todas as suas cifras?`)) {
      if (this.editingId() === id) this.editingId.set(null);
      await this.categoryService.remove(id);
    }
  }

  // Gerenciamento de cantores (músico only)
  newCantorEmail = signal('');
  addingCantor = signal(false);

  async addCantor() {
    const email = this.newCantorEmail().trim();
    if (!email) return;
    await this.role.addCantorEmail(email);
    this.newCantorEmail.set('');
    this.addingCantor.set(false);
  }

  async removeCantor(email: string) {
    if (confirm(`Remover "${email}" dos cantores?`)) {
      await this.role.removeCantorEmail(email);
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
