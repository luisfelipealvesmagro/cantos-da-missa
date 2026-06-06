import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { IconComponent } from '../../shared/icon/icon.component';

@Component({
  selector: 'app-cantor-access',
  standalone: true,
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cantor-access.component.html',
  styleUrl: './cantor-access.component.scss',
})
export class CantorAccessComponent {
  protected auth = inject(AuthService);

  signOut() { this.auth.signOut(); }
}
