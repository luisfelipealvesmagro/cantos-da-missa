import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnDestroy, Output, viewChild } from '@angular/core';
import { IconComponent } from '../icon/icon.component';
import { ConfettiHandle, startConfetti } from '../utils/confetti';

@Component({
  selector: 'app-mass-complete-overlay',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './mass-complete-overlay.component.html',
  styleUrl: './mass-complete-overlay.component.scss',
})
export class MassCompleteOverlayComponent implements AfterViewInit, OnDestroy {
  @Output() closed = new EventEmitter<void>();

  private canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private confetti?: ConfettiHandle;

  ngAfterViewInit() {
    const style = getComputedStyle(document.documentElement);
    const colors = [
      style.getPropertyValue('--primary').trim(),
      style.getPropertyValue('--primary-2').trim(),
      '#d4af37',
      '#ffffff',
    ].filter(Boolean);
    this.confetti = startConfetti(this.canvasRef().nativeElement, colors);
  }

  ngOnDestroy() {
    this.confetti?.stop();
  }

  close() {
    this.closed.emit();
  }
}
