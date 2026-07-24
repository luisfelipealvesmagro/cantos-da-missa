import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CategoryService } from '../../../core/services/category.service';
import { IconComponent } from '../../../shared/icon/icon.component';
import { Category } from '../../../core/models/category.model';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
})
export class CategoryFormComponent implements OnInit {
  private categoryService = inject(CategoryService);

  @Input() initial?: Category;
  @Output() save = new EventEmitter<{ name: string; icon: string }>();
  @Output() cancel = new EventEmitter<void>();

  name = signal('');
  icon = signal('music_note');
  error = signal<string | null>(null);

  iconOptions = [
    'music_note', 'chalice', 'church', 'star', 'favorite',
    'self_improvement', 'auto_awesome', 'menu_book', 'redeem', 'bakery_dining',
    'waving_hand', 'celebration', 'spa',
    // litúrgicos adicionais
    'crown', 'water_drop', 'flare', 'wb_sunny', 'brightness_5',
    'local_fire_department', 'emoji_nature', 'volunteer_activism', 'mode_of_travel',
    'handshake', 'auto_stories', 'nights_stay',
  ];

  ngOnInit() {
    if (this.initial) {
      this.name.set(this.initial.name);
      this.icon.set(this.initial.icon);
    }
  }

  onNameInput(value: string) {
    this.name.set(value);
    this.error.set(null);
  }

  onSave() {
    const name = this.name().trim();
    if (!name) return;
    const normalized = this.normalize(name);
    const duplicate = this.categoryService
      .categories()
      .some((c) => c.id !== this.initial?.id && this.normalize(c.name) === normalized);
    if (duplicate) {
      this.error.set(`Já existe uma categoria chamada "${name}".`);
      return;
    }
    this.save.emit({ name, icon: this.icon() });
  }

  onCancel() {
    this.cancel.emit();
  }

  private normalize(value: string): string {
    return value.trim().toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  }
}
