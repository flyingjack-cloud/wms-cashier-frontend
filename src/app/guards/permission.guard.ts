import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, forkJoin, map, of, timeout } from 'rxjs';
import { Permission, Role } from '../models/authority';
import { UserService } from '../services/user.service';
import { ToastService } from '../services/toast.service';

export const permissionGuard = (permissionCheck: Permission): CanActivateFn => {
  return () => {
    const userService = inject(UserService);
    const toastService = inject(ToastService);
    const router = inject(Router);

    // Role already cached (e.g. from a previous navigation) - decide synchronously.
    // Otherwise fetch it directly so a failed request rejects immediately instead
    // of waiting on a cached value that a swallowed HTTP error would never update.
    const roleAndPermissions$ = userService.role.getValue() !== Role.BLANK
      ? of([userService.role.getValue(), userService.permissions.getValue()] as const)
      : forkJoin([userService.fetchRole(), userService.fetchPermission()]);

    return roleAndPermissions$.pipe(
      timeout(8000),
      map(([role, permissions]) => {
        const isOwner = role === Role.OWNER;
        const hasPermission = permissions.some(p => p.authority === permissionCheck);
        if (isOwner || hasPermission) return true;
        toastService.push('权限不足', 'warning');
        return router.createUrlTree(['/cashier/center/store']);
      }),
      catchError(() => {
        toastService.push('权限验证失败，请稍后重试', 'error');
        return of(router.createUrlTree(['/cashier/center/store']));
      }),
    );
  };
};
