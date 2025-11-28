// OpenID Connect Configuration for Cognito User Pool
// Update these values with your Cognito User Pool details

export const oidcConfig = {
  // Your Cognito User Pool region
  region: 'eu-central-1',

  // Your Cognito User Pool ID (format: region_randomString)
  // Example: us-east-1_xxxxxxxxx
  userPoolId: 'eu-central-1_dDyaPMral',

  // Your Cognito App Client ID
  clientId: '1isqd8m6fdprpgu38hagu7cea4',

  // Your Cognito domain (just the domain name, not full URL)
  // This should match what you configured in Cognito
  // Example: myfakegods-auth (NOT us-east-1_myfakegods-auth)
  cognitoDomain: 'eu-central-1ddyapmral',

  // Redirect URI after successful login (includes /callback path)
  redirectUri: process.env.NODE_ENV === 'production'
    ? 'https://d84l1y8p4kdic.cloudfront.net'
    : 'http://localhost:3000/callback',

  // Redirect URI after logout
  logoutRedirectUri: process.env.NODE_ENV === 'production'
    ? 'https://yourdomain.com'
    : 'http://localhost:3000',

  // OIDC Issuer URL (constructed from domain and region)
  // Format: https://cognito-idp.{region}.amazonaws.com/{userPoolId}
  get issuer() {
    return `https://cognito-idp.${this.region}.amazonaws.com/${this.userPoolId}`;
  },

  // OIDC Discovery URL
  get discoveryUrl() {
    return `${this.issuer}/.well-known/openid-configuration`;
  },

  // Authorization endpoint
  get authorizationEndpoint() {
    return `https://${this.cognitoDomain}.auth.${this.region}.amazoncognito.com/oauth2/authorize`;
  },

  // Token endpoint
  get tokenEndpoint() {
    return `https://${this.cognitoDomain}.auth.${this.region}.amazoncognito.com/oauth2/token`;
  },

  // Userinfo endpoint
  get userinfoEndpoint() {
    return `https://${this.cognitoDomain}.auth.${this.region}.amazoncognito.com/oauth2/userInfo`;
  },

  // Logout endpoint
  get logoutEndpoint() {
    return `https://${this.cognitoDomain}.auth.${this.region}.amazoncognito.com/logout?client_id=${this.clientId}&logout_uri=${encodeURIComponent(this.logoutRedirectUri)}`;
  },

  // OIDC scopes to request (must match "Allowed OAuth Scopes" in Cognito App Client)
  // Cognito shows: email, openid, phone — do not request scopes not enabled (eg. "profile")
  scopes: ['openid', 'email', 'phone', 'profile'],

  // Response type for authorization flow
  responseType: 'code',

  // Client authentication method
  clientAuthMethod: 'none', // For public clients (SPAs)
};

// Export helper to get the OpenID configuration URL
export const getOIDCConfigUrl = () => oidcConfig.discoveryUrl;

// Export the OIDC issuer URL
export const getIssuerUrl = () => oidcConfig.issuer;
