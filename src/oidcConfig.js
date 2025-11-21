// OpenID Connect Configuration for Cognito User Pool
// Update these values with your Cognito User Pool details

export const oidcConfig = {
  // Your Cognito User Pool region
  region: 'us-east-1',

  // Your Cognito User Pool ID (format: region_randomString)
  // Example: us-east-1_xxxxxxxxx
  userPoolId: 'us-east-1_GSnf0PN2f',

  // Your Cognito App Client ID
  clientId: '5fiaeb4q798nptctg97mfgc9p3',

  // Your Cognito domain (just the domain name, not full URL)
  // Example: myfakegods-auth
  cognitoDomain: 'us-east-1gsnf0pn2f',

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

  // OIDC scopes to request
  scopes: ['openid', 'email', 'profile'],

  // Response type for authorization flow
  responseType: 'code',

  // Client authentication method
  clientAuthMethod: 'none', // For public clients (SPAs)
};

// Export helper to get the OpenID configuration URL
export const getOIDCConfigUrl = () => oidcConfig.discoveryUrl;

// Export the OIDC issuer URL
export const getIssuerUrl = () => oidcConfig.issuer;
