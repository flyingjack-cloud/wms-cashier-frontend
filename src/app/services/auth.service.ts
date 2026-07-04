import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from } from 'rxjs';
import { AuthConfig, OAuthService } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly postLoginRedirectKey = 'wms.postLoginRedirectUrl';
  private initPromise?: Promise<boolean>;
  private refreshPromise?: Promise<boolean>;

  constructor(
    private oauthService: OAuthService,
    private router: Router,
  ) {
    this.oauthService.configure(this.createAuthConfig());
    this.oauthService.setupAutomaticSilentRefresh();
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  getAccessToken(): string | null {
    return this.isAuthenticated() ? this.oauthService.getAccessToken() : null;
  }

  initiateLogin(returnUrl?: string | null): void {
    if (this.isOAuthCallbackUrl()) return;
    if (returnUrl && returnUrl !== '/welcome') {
      sessionStorage.setItem(this.postLoginRedirectKey, returnUrl);
    }
    void this.initialize().then(() => this.oauthService.initCodeFlow());
  }

  consumePostLoginRedirectUrl(): string {
    const url = sessionStorage.getItem(this.postLoginRedirectKey) || '/cashier';
    sessionStorage.removeItem(this.postLoginRedirectKey);
    return url;
  }

  handleCallback(): Observable<boolean> {
    return from(this.initialize());
  }

  refreshToken(): Observable<boolean> {
    return from(this.refreshAccessToken());
  }

  logout(): void {
    this.localLogoutToWelcome();
  }

  isOAuthCallbackUrl(): boolean {
    return window.location.pathname === '/callback'
      || window.location.pathname === '/oauth2/callback';
  }

  private initialize(): Promise<boolean> {
    if (!this.initPromise) {
      this.initPromise = this.oauthService.loadDiscoveryDocumentAndTryLogin()
        .then(() => this.isAuthenticated())
        .catch(error => {
          this.initPromise = undefined;
          throw error;
        });
    }
    return this.initPromise;
  }

  private refreshAccessToken(): Promise<boolean> {
    // Dedupe concurrent refreshes so parallel 401s don't fire multiple
    // token refreshes (refresh token rotation would invalidate all but one).
    if (!this.refreshPromise) {
      this.refreshPromise = this.doRefresh().finally(() => {
        this.refreshPromise = undefined;
      });
    }
    return this.refreshPromise;
  }

  private async doRefresh(): Promise<boolean> {
    await this.initialize();
    if (this.isAuthenticated()) return true;
    if (!this.oauthService.getRefreshToken()) return false;
    await this.oauthService.refreshToken();
    return this.isAuthenticated();
  }

  private localLogoutToWelcome(): void {
    sessionStorage.removeItem(this.postLoginRedirectKey);
    this.refreshPromise = undefined;
    this.initPromise = undefined;
    this.oauthService.logOut(true);
    void this.router.navigate(['/welcome']);
  }

  private createAuthConfig(): AuthConfig {
    const origin = window.location.origin;
    return {
      issuer: environment.oauthIssuer,
      clientId: environment.oauthClientId,
      redirectUri: environment.oauthRedirectUri || `${origin}/callback`,
      postLogoutRedirectUri: environment.oauthPostLogoutRedirectUri || `${origin}/welcome`,
      responseType: 'code',
      scope: this.normalizeOAuthScope(environment.oauthScope),
      preserveRequestedRoute: true,
      requireHttps: environment.production,
      showDebugInformation: !environment.production,
    };
  }

  private normalizeOAuthScope(scope: string): string {
    return scope
      .split(/[\s,]+/)
      .filter(Boolean)
      .join(' ');
  }
}
