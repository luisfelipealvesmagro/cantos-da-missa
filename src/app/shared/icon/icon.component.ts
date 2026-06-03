import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

const SVG_ICONS: Record<string, string> = {
  // Cálice litúrgico
  chalice:
    'M4 3 L20 3 C19.5 9.5 16 13.5 13 13.5 L11 13.5 C8 13.5 4.5 9.5 4 3 Z ' +
    'M11 13.5 V19 H13 V13.5 Z ' +
    'M7 19 H17 Q17 21.5 16 21.5 H8 Q7 21.5 7 19 Z',
};

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (svgPath) {
      <svg [attr.width]="size" [attr.height]="size" viewBox="0 0 24 24"
           fill="currentColor" aria-hidden="true">
        <path [attr.d]="svgPath"/>
      </svg>
    } @else {
      <span class="material-symbols-outlined" [style.font-size.px]="size" aria-hidden="true">{{ name }}</span>
    }
  `,
  styles: [':host { display: inline-flex; }'],
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 24;

  get svgPath(): string | null {
    return SVG_ICONS[this.name] ?? null;
  }
}
