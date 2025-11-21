/**
 * Simple OIDC Service for Cognito authentication
 * Browser-compatible implementation without Node.js dependencies
 */

import { oidcConfig } from './oidcConfig';

/**
 * Generate authorization URL for login
 */
export const getAuthorizationUrl = (options = {}) => {
  const nonce = generateNonce();
  const state = generateState();

  const params = new URLSearchParams({
    client_id: oidcConfig.clientId,
    response_type: oidcConfig.responseType || 'code',
    scope: (oidcConfig.scopes || []).join(' '),
    redirect_uri: oidcConfig.redirectUri,
    nonce: nonce,
    state: state,
  });

  // Allow passing extra query params like prompt=signup
  Object.keys(options || {}).forEach((k) => {
    if (options[k] !== undefined && options[k] !== null) {
      params.set(k, options[k]);
    }
  });

  return `${oidcConfig.authorizationEndpoint}?${params.toString()}`;
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

  // Redirect to logout endpoint
  window.location.href = oidcConfig.logoutEndpoint;
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
