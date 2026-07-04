import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';

describe('AuthService refreshToken', () => {
  let oauth: jasmine.SpyObj<OAuthService>;
  let router: jasmine.SpyObj<Router>;
  let service: AuthService;
  let validToken: boolean;

  beforeEach(() => {
    validToken = false;

    oauth = jasmine.createSpyObj<OAuthService>('OAuthService', [
      'configure',
      'setupAutomaticSilentRefresh',
      'hasValidAccessToken',
      'getAccessToken',
      'loadDiscoveryDocumentAndTryLogin',
      'getRefreshToken',
      'refreshToken',
      'initCodeFlow',
      'logOut',
      'revokeTokenAndLogout',
    ]);
    oauth.hasValidAccessToken.and.callFake(() => validToken);
    oauth.loadDiscoveryDocumentAndTryLogin.and.resolveTo(true);
    oauth.refreshToken.and.resolveTo({} as never);
    oauth.revokeTokenAndLogout.and.resolveTo(null);
    oauth.logoutUrl = 'https://auth.example.com/logout';
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: OAuthService, useValue: oauth },
        { provide: Router, useValue: router },
      ],
    });
    service = TestBed.inject(AuthService);
  });

  it('returns true without refreshing when already authenticated', async () => {
    validToken = true;

    const result = await firstValueFrom(service.refreshToken());

    expect(result).toBeTrue();
    expect(oauth.refreshToken).not.toHaveBeenCalled();
  });

  it('returns false without refreshing when no refresh token exists', async () => {
    validToken = false;
    oauth.getRefreshToken.and.returnValue(null as never);

    const result = await firstValueFrom(service.refreshToken());

    expect(result).toBeFalse();
    expect(oauth.refreshToken).not.toHaveBeenCalled();
  });

  it('refreshes and returns true when a refresh token is available', async () => {
    validToken = false;
    oauth.getRefreshToken.and.returnValue('refresh-token');
    oauth.refreshToken.and.callFake(async () => {
      validToken = true;
      return {} as never;
    });

    const result = await firstValueFrom(service.refreshToken());

    expect(result).toBeTrue();
    expect(oauth.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('returns false when refresh fails to yield a valid token', async () => {
    validToken = false;
    oauth.getRefreshToken.and.returnValue('refresh-token');
    // refresh resolves but token is still invalid afterwards
    oauth.refreshToken.and.resolveTo({} as never);

    const result = await firstValueFrom(service.refreshToken());

    expect(result).toBeFalse();
    expect(oauth.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('dedupes concurrent refreshes into a single token refresh', async () => {
    validToken = false;
    oauth.getRefreshToken.and.returnValue('refresh-token');
    let resolveRefresh: (() => void) | undefined;
    oauth.refreshToken.and.callFake(
      () =>
        new Promise<never>(resolve => {
          resolveRefresh = () => {
            validToken = true;
            resolve({} as never);
          };
        }),
    );

    const p1 = firstValueFrom(service.refreshToken());
    const p2 = firstValueFrom(service.refreshToken());
    // doRefresh awaits initialize() first, so wait until the single
    // underlying refresh has actually started before resolving it.
    await new Promise<void>(res => {
      const check = () => (resolveRefresh ? res() : setTimeout(check));
      check();
    });
    resolveRefresh!();
    const [r1, r2] = await Promise.all([p1, p2]);

    expect(r1).toBeTrue();
    expect(r2).toBeTrue();
    expect(oauth.refreshToken).toHaveBeenCalledTimes(1);
  });

  it('allows a new refresh after a previous one settles', async () => {
    validToken = false;
    oauth.getRefreshToken.and.returnValue('refresh-token');
    oauth.refreshToken.and.callFake(async () => {
      validToken = true;
      return {} as never;
    });

    await firstValueFrom(service.refreshToken());

    // token expires again -> a second refresh must actually run
    validToken = false;
    await firstValueFrom(service.refreshToken());

    expect(oauth.refreshToken).toHaveBeenCalledTimes(2);
  });

  it('clears local auth state and navigates to welcome on logout', () => {
    oauth.getAccessToken.and.returnValue('access-token');
    oauth.getRefreshToken.and.returnValue('refresh-token');

    service.logout();

    expect(oauth.logOut.calls.mostRecent().args).toEqual([true]);
    expect(oauth.revokeTokenAndLogout).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/welcome']);
  });
});
