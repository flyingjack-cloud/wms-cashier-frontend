import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { OAuthStorage, provideOAuthClient } from 'angular-oauth2-oidc';
import { routes } from './app.routes';
import { apiInterceptor } from './interceptors/api.interceptor';

const WMS_DATE_FORMAT = {
  parse: { dateInput: 'YYYY/MM/DD' },
  display: {
    dateInput: 'YYYY/MM/DD',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export function oauthStorageFactory(): OAuthStorage {
  return sessionStorage;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([apiInterceptor])),
    provideOAuthClient(),
    { provide: OAuthStorage, useFactory: oauthStorageFactory },
    provideAnimations(),
    provideNativeDateAdapter(),
    { provide: MAT_DATE_FORMATS, useValue: WMS_DATE_FORMAT },
    { provide: MAT_DATE_LOCALE, useValue: 'zh-Hans' },
  ],
};
