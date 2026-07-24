import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { IconComponent } from '../icon/icon.component';
import { extractYoutubeId } from '../utils/youtube';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
})
export class VideoPlayerComponent {
  private sanitizer = inject(DomSanitizer);

  videoUrl = input<string | undefined>(undefined);
  open = input(false);
  closed = output<void>();

  embedUrl = computed(() => {
    const id = extractYoutubeId(this.videoUrl() ?? '');
    if (!id) return null;
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}`);
  });

  close(): void {
    this.closed.emit();
  }
}
