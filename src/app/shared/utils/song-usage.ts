import { Playlist } from '../../core/models/playlist.model';

/** Conta em quantas playlists (missas) cada música aparece. Repetição na mesma playlist conta 1. */
export function countSongUsage(playlists: Playlist[]): Map<string, number> {
  const usage = new Map<string, number>();
  for (const playlist of playlists) {
    for (const songId of new Set(playlist.songIds ?? [])) {
      usage.set(songId, (usage.get(songId) ?? 0) + 1);
    }
  }
  return usage;
}

export function formatUsage(count: number): string {
  if (count === 0) return 'nunca tocada';
  return count === 1 ? '1 missa' : `${count} missas`;
}
