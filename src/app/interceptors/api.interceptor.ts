import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export const apiInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const toast = inject(ToastService);
  const router = inject(Router);

  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }

  const buildApiReq = () => {
    const token = authService.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return req.clone({
      url: `${environment.wmsApiUrl}/${req.url}`,
      setHeaders: headers,
    });
  };

  const promptRelogin = () => {
    toast.push('验证信息失效，请重新登陆', 'error');
    void router.navigate(['/welcome']);
    return throwError(() => new Error('Request failed'));
  };

  return next(buildApiReq()).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 0:
          toast.push('网络错误，请重试', 'error');
          break;
        case 500:
          toast.push('服务器未响应，请联系客服或稍后尝试', 'error');
          break;
        case 401:
          // Skip re-login trigger for auth endpoints to avoid infinite loops
          if (!req.url.startsWith('oauth/') && !authService.isOAuthCallbackUrl()) {
            // Token 可能只是过期，先尝试静默刷新并重放请求，刷新失败才提示重新登录
            return authService.refreshToken().pipe(
              catchError(() => promptRelogin()),
              switchMap(refreshed => (refreshed ? next(buildApiReq()) : promptRelogin())),
            );
          }
          break;
        case 400: {
          const errorContent = error.error?.['error'] ? error.error['error'] : error.error;
          const message = errorContent?.message ? errorContent.message : errorContent;
          toast.push(message, 'error');
          break;
        }
      }
      return throwError(() => new Error('Request failed'));
    }),
  );
};
