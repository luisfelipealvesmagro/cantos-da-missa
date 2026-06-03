import { Injectable } from '@angular/core';

/**
 * Transposição de acordes por semitons. Puramente algorítmico — não depende
 * de nenhum conteúdo externo. Lida com baixo invertido (G/B), menores,
 * sétimas, sus, add, dim, aug etc., preservando o sufixo do acorde.
 */
@Injectable({ providedIn: 'root' })
export class TransposeService {
  private readonly sharp = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  private readonly flat  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  private readonly base: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

  /** Lista de tons maiores e menores para o seletor, em ordem alfabética. */
  readonly keys = [
    'A', 'A#', 'A#m', 'Am',
    'B', 'Bm',
    'C', 'C#', 'C#m', 'Cm',
    'D', 'D#', 'D#m', 'Dm',
    'E', 'Em',
    'F', 'F#', 'F#m', 'Fm',
    'G', 'G#', 'G#m', 'Gm',
  ];

  /** Índice 0–11 de uma nota raiz como 'C', 'F#', 'Bb'. */
  private noteToIndex(note: string): number | null {
    const m = note.match(/^([A-G])([#b]?)/);
    if (!m) return null;
    let idx = this.base[m[1]];
    if (m[2] === '#') idx = (idx + 1) % 12;
    if (m[2] === 'b') idx = (idx + 11) % 12;
    return idx;
  }

  /** Transpõe um único token de acorde (com baixo invertido opcional). */
  transposeChord(chord: string, steps: number, preferFlat = false): string {
    if (!chord || steps === 0) return chord;
    const [main, bass] = chord.split('/');
    const tMain = this.shiftToken(main, steps, preferFlat);
    if (bass !== undefined) return `${tMain}/${this.shiftToken(bass, steps, preferFlat)}`;
    return tMain;
  }

  private shiftToken(token: string, steps: number, preferFlat: boolean): string {
    const m = token.match(/^([A-G])([#b]?)(.*)$/);
    if (!m) return token;
    const idx = this.noteToIndex(m[1] + (m[2] || ''));
    if (idx === null) return token;
    const newIdx = (((idx + steps) % 12) + 12) % 12;
    return (preferFlat ? this.flat : this.sharp)[newIdx] + (m[3] || '');
  }

  /** Distância em semitons entre dois tons (origem → destino). */
  semitonesBetween(from: string, to: string): number {
    const a = this.noteToIndex(from);
    const b = this.noteToIndex(to);
    if (a === null || b === null) return 0;
    return (((b - a) % 12) + 12) % 12;
  }

  /** Verifica se um token parece um acorde válido (usado no conversor). */
  isChord(token: string): boolean {
    const t = token.trim();
    if (!t) return false;
    return /^[A-G][#b]?(maj|min|m|dim|aug|sus|add|M)?\d{0,2}M?(sus\d|add\d{1,2}|[#b]\d{1,2}|\+|°|ø)*(\([^)]*\))?(\/[A-G][#b]?)?$/.test(t);
  }
}
