import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { RoleService } from '../services/role.service';

/** Bloqueia rotas exclusivas do músico (edição, exclusão). Cantores são redirecionados para /. */
export const roleGuard: CanActivateFn = () => {
  const role = inject(RoleService);
  const router = inject(Router);

  return toObservable(role.isReady).pipe(
    filter(ready => ready),
    take(1),
    map(() => role.isMusico() ? true : router.createUrlTree(['/'])),
  );
};
