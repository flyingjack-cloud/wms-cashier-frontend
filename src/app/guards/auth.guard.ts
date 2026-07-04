import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  const welcomeUrl = router.createUrlTree(['/welcome'], {
    queryParams: state.url === '/cashier' ? undefined : { returnUrl: state.url },
  });

  return authService.refreshToken().pipe(
    map(authenticated => authenticated ? true : welcomeUrl),
    catchError(() => of(welcomeUrl)),
  );
};
