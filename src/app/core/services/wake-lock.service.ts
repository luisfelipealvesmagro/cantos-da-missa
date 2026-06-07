import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class WakeLockService {
  private wakeLock: WakeLockSentinel | null = null;

  async acquire(): Promise<void> {
    if (!('wakeLock' in navigator)) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      document.addEventListener('visibilitychange', this.onVisibilityChange);
    } catch {
      // silently ignore: low battery or browser denied
    }
  }

  async release(): Promise<void> {
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    await this.wakeLock?.release();
    this.wakeLock = null;
  }

  // Re-acquire when tab comes back to foreground (browser auto-releases on hide)
  private onVisibilityChange = () => {
    if (document.visibilityState === 'visible') this.acquire();
  };
}
