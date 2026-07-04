import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { of, throwError } from 'rxjs';
import { apiInterceptor } from './api.interceptor';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

describe('apiInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;
  let toast: jasmine.SpyObj<ToastService>;
  let router: jasmine.SpyObj<Router>;

  const apiUrl = (path: string) => `${environment.wmsApiUrl}/${path}`;

  beforeEach(() => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', [
      'getAccessToken',
      'refreshToken',
      'initiateLogin',
      'isOAuthCallbackUrl',
    ]);
    auth.isOAuthCallbackUrl.and.returnValue(false);
    toast = jasmine.createSpyObj<ToastService>('ToastService', ['push']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: auth },
        { provide: ToastService, useValue: toast },
        { provide: Router, useValue: router },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('prefixes the api base url and attaches the bearer token', () => {
    auth.getAccessToken.and.returnValue('token-1');

    http.get('profile/').subscribe();

    const req = httpMock.expectOne(apiUrl('profile/'));
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
    req.flush({});
  });

  it('on 401 refreshes then replays the request with the new token', () => {
    // first call: no valid token; after refresh: new token
    auth.getAccessToken.and.returnValues(null, 'fresh-token');
    auth.refreshToken.and.returnValue(of(true));

    let result: unknown;
    http.get('profile/role').subscribe(res => (result = res));

    const first = httpMock.expectOne(apiUrl('profile/role'));
    expect(first.request.headers.has('Authorization')).toBeFalse();
    first.flush(null, { status: 401, statusText: 'Unauthorized' });

    // replayed request carries the refreshed token and succeeds
    const retry = httpMock.expectOne(apiUrl('profile/role'));
    expect(retry.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retry.flush({ data: 'ADMIN' });

    expect(auth.refreshToken).toHaveBeenCalledTimes(1);
    expect(auth.initiateLogin).not.toHaveBeenCalled();
    expect(result).toEqual({ data: 'ADMIN' });
  });

  it('on 401 with failed refresh redirects to welcome and errors', () => {
    auth.getAccessToken.and.returnValue(null);
    auth.refreshToken.and.returnValue(of(false));

    let errored = false;
    http.get('profile/').subscribe({
      next: () => fail('should not succeed'),
      error: () => (errored = true),
    });

    const req = httpMock.expectOne(apiUrl('profile/'));
    req.flush(null, { status: 401, statusText: 'Unauthorized' });

    expect(auth.initiateLogin).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/welcome']);
    expect(toast.push).toHaveBeenCalledWith('验证信息失效，请重新登陆', 'error');
    expect(errored).toBeTrue();
    // no replay happened
    httpMock.expectNone(apiUrl('profile/'));
  });

  it('on 401 when refreshToken throws redirects to welcome and errors', () => {
    auth.getAccessToken.and.returnValue(null);
    auth.refreshToken.and.returnValue(throwError(() => new Error('boom')));

    let errored = false;
    http.get('profile/').subscribe({ error: () => (errored = true) });

    httpMock.expectOne(apiUrl('profile/')).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(auth.initiateLogin).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/welcome']);
    expect(errored).toBeTrue();
  });

  it('does not prompt re-login for 401 on oauth endpoints', () => {
    auth.getAccessToken.and.returnValue(null);

    http.get('oauth/token').subscribe({ error: () => undefined });

    httpMock.expectOne(apiUrl('oauth/token')).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(auth.refreshToken).not.toHaveBeenCalled();
    expect(auth.initiateLogin).not.toHaveBeenCalled();
  });

  it('does not prompt re-login for 401 while on the OAuth callback page', () => {
    auth.getAccessToken.and.returnValue(null);
    auth.isOAuthCallbackUrl.and.returnValue(true);

    http.get('profile/').subscribe({ error: () => undefined });

    httpMock.expectOne(apiUrl('profile/')).flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(auth.initiateLogin).not.toHaveBeenCalled();
  });

  it('passes through absolute urls untouched (no prefix, no auth header)', () => {
    auth.getAccessToken.and.returnValue('token-1');

    http.get('https://example.com/data').subscribe();

    const req = httpMock.expectOne('https://example.com/data');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush({});
  });
});
