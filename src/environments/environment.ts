export const environment = {
  production: true,
  wmsApiUrl: 'https://api.flyingjack.top/wms',
  // OIDC issuer，必须能访问 /.well-known/openid-configuration
  oauthIssuer: 'https://auth.flyingjack.top',
  // OAuth2 client_id（在 UAC 中注册的客户端 ID）
  oauthClientId: '',
  // 回调地址（必须与 UAC 白名单一致）
  oauthRedirectUri: 'https://wms.flyingjack.top/callback',
  oauthPostLogoutRedirectUri: 'https://wms.flyingjack.top',
  oauthScope: 'openid profile offline_access',
};
