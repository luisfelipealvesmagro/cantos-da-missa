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
import { CategoryFormComponent } from './category-form/category-form.component';
import { Category } from '../../core/models/category.model';
import { APP_VERSION } from '../../shared/utils/app-version';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [RouterLink, IconComponent, CdkDropList, CdkDrag, CdkDragHandle, CategoryFormComponent],
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
  protected version = APP_VERSION;

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
  editingId = signal<string | null>(null);

  async addCategory(data: { name: string; icon: string }) {
    await this.categoryService.add(data.name, data.icon);
    this.adding.set(false);
  }

  startEdit(cat: Category) {
    this.editingId.set(cat.id!);
  }

  async saveEdit(data: { name: string; icon: string }) {
    const id = this.editingId();
    if (!id) return;
    await this.categoryService.update(id, data);
    this.editingId.set(null);
  }

  cancelEdit() { this.editingId.set(null); }

  drop(event: CdkDragDrop<Category[]>) {
    const cats = [...this.categories()];
    moveItemInArray(cats, event.previousIndex, event.currentIndex);
    this.categoryService.reorder(cats);
  }

  async deleteCategory(id: string, name: string) {
    const count = this.counts()[id] ?? 0;
    if (count > 0) {
      alert(`Não é possível excluir: existem ${count} música${count === 1 ? '' : 's'} nesta categoria.`);
      return;
    }
    if (!confirm(`Confirma excluir a categoria "${name}"?`)) return;
    if (this.editingId() === id) this.editingId.set(null);
    try {
      await this.categoryService.remove(id);
    } catch (e) {
      alert((e as Error).message);
    }
  }

  // Gerenciamento de cantores (músico only)
  newCantorEmail = signal('');
  addingCantor = signal(false);
  private cantorAccess = toSignal(this.role.cantorAccessLog$(), { initialValue: [] });

  lastAccessLabel(email: string): string {
    const entry = this.cantorAccess().find(a => a.id === email.toLowerCase());
    if (!entry?.lastAccess) return 'nunca acessou';
    return entry.lastAccess.toDate().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

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
