export const environment = {
  production: false,
  wmsApiUrl: 'http://wms.local/api',
  // OIDC issuer，必须能访问 /.well-known/openid-configuration
  oauthIssuer: 'http://auth.local',
  // OAuth2 client_id（在 UAC 中注册的客户端 ID）
  oauthClientId: 'wms-cashier',
  // 回调地址（必须与 UAC 白名单一致）；留空则使用当前前端域名 + /callback
  oauthRedirectUri: 'http://wms.local/oauth2/callback',
  oauthPostLogoutRedirectUri: '',
  oauthScope: 'openid profile offline_access',
};
