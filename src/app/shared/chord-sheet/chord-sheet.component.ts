import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ChordProService } from '../../core/services/chordpro.service';
import { TransposeService } from '../../core/services/transpose.service';

@Component({
  selector: 'app-chord-sheet',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chord-sheet.component.html',
  styleUrl: './chord-sheet.component.scss',
})
export class ChordSheetComponent {
  private cp = inject(ChordProService);
  private tp = inject(TransposeService);

  body = input.required<string>();
  transposeSteps = input(0);   // semitons escolhidos pelo usuário (muda o som)
  capo = input(0);             // casa do capotraste (muda só a forma)
  fontScale = input(1);
  lyricsOnly = input(false);   // modo cantor: mostra só a letra, sem acordes

  private lines = computed(() => this.cp.parse(this.body()));

  // forma exibida = tom escolhido, deslocado para baixo pelo capotraste
  displayLines = computed(() => {
    const offset = this.transposeSteps() - this.capo();
    return this.lines().map((line) =>
      line.type === 'lyric'
        ? {
            ...line,
            segments: line.segments!.map((s) => ({
              ...s,
              chord: s.chord ? this.tp.transposeChord(s.chord, offset) : s.chord,
            })),
          }
        : line
    );
  });
}
