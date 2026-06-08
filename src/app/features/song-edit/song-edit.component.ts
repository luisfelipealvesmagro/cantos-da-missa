import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SongService } from '../../core/services/song.service';
import { CategoryService } from '../../core/services/category.service';
import { ChordProService } from '../../core/services/chordpro.service';
import { TransposeService } from '../../core/services/transpose.service';
import { ChordSheetComponent } from '../../shared/chord-sheet/chord-sheet.component';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-song-edit',
  standalone: true,
  imports: [ChordSheetComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './song-edit.component.html',
  styleUrl: './song-edit.component.scss',
})
export class SongEditComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private songService = inject(SongService);
  private categoryService = inject(CategoryService);
  private cp = inject(ChordProService);
  private tp = inject(TransposeService);

  categories = this.categoryService.categories;
  keys = this.tp.keys;

  editingId = signal<string | null>(null);
  title = signal('');
  author = signal('');
  categoryId = signal<string | null>(null);
  originalKey = signal('G');
  capo = signal(0);
  body = signal('');
  showPreview = signal(true);
  transposeBody = signal(true);

  isEdit = computed(() => this.editingId() !== null);
  canSave = computed(() => this.title().trim() !== '' && this.categoryId() !== null);
  hasBodyChords = computed(() => /\[[A-G]/.test(this.body()));

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const catParam = this.route.snapshot.paramMap.get('categoryId');
    if (idParam) {
      this.songService.get(idParam).then((s) => {
        if (!s) return;
        this.editingId.set(s.id!);
        this.title.set(s.title);
        this.author.set(s.author ?? '');
        this.categoryId.set(s.categoryId);
        this.originalKey.set(s.originalKey);
        this.capo.set(s.capo ?? 0);
        this.body.set(s.body);
      });
    } else if (catParam) {
      this.categoryId.set(catParam);
    }
  }

  onKeyChange(newKey: string): void {
    const fromKey = this.originalKey();
    if (this.transposeBody() && this.hasBodyChords() && fromKey !== newKey) {
      const steps = this.tp.semitonesBetween(fromKey, newKey);
      const transposed = this.body().replace(/\[([^\]]+)\]/g, (_, chord) => {
        if (!this.tp.isChord(chord)) return `[${chord}]`;
        return `[${this.tp.transposeChord(chord, steps)}]`;
      });
      this.body.set(transposed);
    }
    this.originalKey.set(newKey);
  }

  convertPasted() {
    const raw = this.body();
    this.body.set(this.cp.plainToChordPro(raw));
  }

  async save() {
    if (!this.canSave()) return;
    const payload = {
      categoryId: this.categoryId()!,
      title: this.title().trim(),
      author: this.author().trim() || undefined,
      originalKey: this.originalKey(),
      capo: this.capo(),
      body: this.body(),
    };
    if (this.isEdit()) {
      await this.songService.update(this.editingId()!, payload);
      this.router.navigate(['/musica', this.editingId()]);
    } else {
      const id = await this.songService.add(payload);
      this.router.navigate(['/musica', id]);
    }
  }

  cancel() {
    if (this.isEdit()) this.router.navigate(['/musica', this.editingId()]);
    else this.router.navigate(['/categoria', this.categoryId()]);
  }
}
