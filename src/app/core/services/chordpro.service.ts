import { Injectable, inject } from '@angular/core';
import { TransposeService } from './transpose.service';

export interface Segment { chord: string | null; text: string; }
export interface SheetLine {
  type: 'lyric' | 'label' | 'blank';
  segments?: Segment[];
  label?: string;
}

@Injectable({ providedIn: 'root' })
export class ChordProService {
  private tp = inject(TransposeService);

  /** Converte o corpo ChordPro em linhas renderizáveis. */
  parse(body: string): SheetLine[] {
    const lines = (body || '').replace(/\r/g, '').split('\n');
    return lines.map((raw) => {
      const line = raw.replace(/\s+$/, '');
      if (line.trim() === '') return { type: 'blank' as const };

      const dir = line.trim().match(/^\{\s*(?:c|comment|section)\s*:\s*(.+?)\s*\}$/i);
      if (dir) return { type: 'label' as const, label: dir[1] };
      if (/^\{\s*(soc|sob)\s*\}$/i.test(line.trim())) return { type: 'label' as const, label: 'Refrão' };
      if (/^\{.*\}$/.test(line.trim())) return { type: 'blank' as const };

      return { type: 'lyric' as const, segments: this.parseLine(line) };
    });
  }

  private parseLine(line: string): Segment[] {
    const segments: Segment[] = [];
    const re = /\[([^\]]+)\]/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;
    let currentChord: string | null = null;
    while ((match = re.exec(line))) {
      segments.push({ chord: currentChord, text: line.slice(lastIndex, match.index) });
      currentChord = match[1];
      lastIndex = re.lastIndex;
    }
    segments.push({ chord: currentChord, text: line.slice(lastIndex) });
    return segments.filter((s, i) => i === 0 || s.text !== '' || s.chord !== null);
  }

  /**
   * Conversor: texto com acordes numa linha e letra na linha de baixo
   * (estilo Cifra Club) → ChordPro com [acordes] embutidos na letra.
   */
  plainToChordPro(text: string): string {
    const lines = (text || '').replace(/\r/g, '').split('\n');
    const out: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // [Intro], [Refrão], [Primeira Parte] → {c: Label}
      const sectionMatch = line.match(/^\s*\[([^\]]+)\]\s*(.*?)\s*$/);
      if (sectionMatch && !this.tp.isChord(sectionMatch[1].trim())) {
        out.push(`{c: ${sectionMatch[1].trim()}}`);
        const rest = sectionMatch[2].trim();
        if (rest) {
          out.push(this.isChordLine(rest) ? rest.replace(/(\S+)/g, '[$1]') : rest);
        }
        continue;
      }

      // Strip parenthetical alternates — ( C/E D ) — only for detection/merge;
      // positions before the first '(' are preserved exactly.
      const parenIdx = line.indexOf('(');
      const forDetect = parenIdx >= 0 ? line.slice(0, parenIdx).trimEnd() : line;

      if (this.isChordLine(forDetect)) {
        const next = lines[i + 1];
        const nextClean = next !== undefined ? next.replace(/\s*\([^)]*\)/g, '') : '';
        const isNextLyric = next !== undefined
          && next.trim() !== ''
          && !this.isChordLine(nextClean)
          && !/^\s*\[[^\]]+\]/.test(next);

        if (isNextLyric) {
          out.push(this.merge(forDetect, next));
          i++;
        } else {
          out.push(forDetect.trim().replace(/(\S+)/g, '[$1]'));
        }
      } else {
        out.push(line);
      }
    }

    return out.join('\n');
  }

  private isChordLine(line: string): boolean {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    return tokens.length > 0 && tokens.every((t) => this.tp.isChord(t));
  }

  private merge(chordLine: string, lyricLine: string): string {
    const matches: { chord: string; col: number }[] = [];
    const re = /\S+/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(chordLine))) matches.push({ chord: m[0], col: m.index });
    let result = lyricLine;
    const maxCol = matches.reduce((a, b) => Math.max(a, b.col), 0);
    if (result.length < maxCol) result = result.padEnd(maxCol, ' ');
    for (let i = matches.length - 1; i >= 0; i--) {
      const pos = Math.min(matches[i].col, result.length);
      result = result.slice(0, pos) + `[${matches[i].chord}]` + result.slice(pos);
    }
    return result;
  }
}
