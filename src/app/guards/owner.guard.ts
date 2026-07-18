import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { Role } from '../models/authority';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';

export const ownerGuard: CanActivateFn = () => {
  const users = inject(UserService);
  const router = inject(Router);
  const toast = inject(ToastService);
  const role$ = users.role.getValue() === Role.BLANK ? users.fetchRole() : of(users.role.getValue());
  return role$.pipe(
    map(role => {
      if (role === Role.OWNER) return true;
      toast.push('只有店主可以管理票据模板', 'warning');
      return router.createUrlTree(['/cashier/center/profile']);
    }),
    catchError(() => of(router.createUrlTree(['/cashier/center/profile']))),
  );
};
