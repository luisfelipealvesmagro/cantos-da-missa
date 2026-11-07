import { Playlist } from '../../core/models/playlist.model';
import { countSongUsage, formatUsage } from './song-usage';

const pl = (songIds: string[]): Playlist => ({ name: 'p', songIds, createdAt: 0, updatedAt: 0 });

describe('countSongUsage', () => {
  it('retorna mapa vazio sem playlists', () => {
    expect(countSongUsage([]).size).toBe(0);
  });

  it('conta uma vez por playlist, mesmo se repetida nela', () => {
    const usage = countSongUsage([pl(['a', 'a', 'b']), pl(['a']), pl([])]);
    expect(usage.get('a')).toBe(2);
    expect(usage.get('b')).toBe(1);
    expect(usage.get('c')).toBeUndefined();
  });
});

describe('formatUsage', () => {
  it('formata singular, plural e zero', () => {
    expect(formatUsage(0)).toBe('nunca tocada');
    expect(formatUsage(1)).toBe('1 missa');
    expect(formatUsage(3)).toBe('3 missas');
  });
});
