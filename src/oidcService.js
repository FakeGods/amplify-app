/**
 * Simple OIDC Service for Cognito authentication
 * Browser-compatible implementation without Node.js dependencies
 */

import { oidcConfig } from './oidcConfig';

/**
 * Generate authorization URL for login
 */
export const getAuthorizationUrl = async (options = {}) => {
  const nonce = generateNonce();
  const state = generateState();

  // PKCE: generate a code_verifier and code_challenge
  const codeVerifier = generateCodeVerifier();
  // store verifier to use when exchanging code
  sessionStorage.setItem('oidc_code_verifier', codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  const params = new URLSearchParams({
    client_id: oidcConfig.clientId,
    response_type: oidcConfig.responseType || 'code',
    scope: (oidcConfig.scopes || []).join(' '),
    redirect_uri: oidcConfig.redirectUri,
    nonce: nonce,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  // Allow passing extra query params like prompt=signup
  Object.keys(options || {}).forEach((k) => {
    if (options[k] !== undefined && options[k] !== null) {
      params.set(k, options[k]);
    }
  });

  const authUrl = `${oidcConfig.authorizationEndpoint}?${params.toString()}`;
  console.log('Authorization URL:', authUrl);
  console.log('OIDC Config:', {
    endpoint: oidcConfig.authorizationEndpoint,
    clientId: oidcConfig.clientId,
    redirectUri: oidcConfig.redirectUri,
  });

  return authUrl;
};

/**
 * Exchange authorization code for tokens
 */
export const exchangeCodeForTokens = async (code) => {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: oidcConfig.clientId,
      code: code,
      redirect_uri: oidcConfig.redirectUri,
      // include PKCE code_verifier if present
      code_verifier: sessionStorage.getItem('oidc_code_verifier') || '',
    });

    const response = await fetch(oidcConfig.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params,
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.status}`);
    }

    const tokenSet = await response.json();

    // Store tokens
    localStorage.setItem('access_token', tokenSet.access_token);
    localStorage.setItem('id_token', tokenSet.id_token);
    if (tokenSet.refresh_token) {
      localStorage.setItem('refresh_token', tokenSet.refresh_token);
    }

    return tokenSet;
  } catch (error) {
    console.error('Token exchange error:', error);
    throw error;
  }
};

/**
 * Get user information from ID token
 */
export const getUserFromIdToken = () => {
  try {
    const idToken = localStorage.getItem('id_token');
    if (!idToken) {
      return null;
    }

    // Decode JWT (basic decode, doesn't verify signature)
    const claims = parseJwt(idToken);
    return claims;
  } catch (error) {
    console.error('Error parsing ID token:', error);
    return null;
  }
};

/**
 * Logout and clear tokens
 */
export const logout = () => {
  // Clear stored tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('refresh_token');
  sessionStorage.removeItem('oidc_nonce');
  sessionStorage.removeItem('oidc_state');
  sessionStorage.removeItem('oidc_code_verifier');

  // Build logout URL with proper parameters
  const logoutUrl = `https://${oidcConfig.cognitoDomain}.auth.${oidcConfig.region}.amazoncognito.com/logout?client_id=${oidcConfig.clientId}&logout_uri=${encodeURIComponent(oidcConfig.logoutRedirectUri)}`;
  
  console.log('Logging out, redirecting to:', logoutUrl);
  
  // Redirect to logout endpoint
  window.location.href = logoutUrl;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const accessToken = localStorage.getItem('access_token');
  const idToken = localStorage.getItem('id_token');
  return !!(accessToken && idToken);
};

/**
 * Get access token
 */
export const getAccessToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Utility function to decode JWT token
 */
const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return {};
  }
};

/**
 * Generate random nonce for OIDC flow
 */
const generateNonce = () => {
  const nonce = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('oidc_nonce', nonce);
  return nonce;
};

/**
 * Generate random state for OIDC flow
 */
const generateState = () => {
  const state = Math.random().toString(36).substring(2, 15) + 
                Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('oidc_state', state);
  return state;
};

// PKCE helpers
const generateCodeVerifier = (length = 64) => {
  // create a random string of given length using characters allowed in code verifier
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  const array = new Uint32Array(length);
  window.crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
};

const generateCodeChallenge = async (verifier) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  const bytes = new Uint8Array(digest);
  return base64UrlEncode(bytes);
};

const base64UrlEncode = (bytes) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
