import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="material-symbols-outlined" [style.font-size.px]="size" aria-hidden="true">{{ name }}</span>`,
  styles: [':host { display: inline-flex; }'],
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 24;
}
