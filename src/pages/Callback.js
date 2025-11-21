import React, { useEffect, useState } from 'react';
import { exchangeCodeForTokens } from '../oidcService';

/**
 * Callback component - Handles OAuth redirect after login
 * Exchanges authorization code for tokens
 */
const Callback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');

        if (!code) {
          throw new Error('No authorization code received');
        }

        // Validate state parameter
        const savedState = sessionStorage.getItem('oidc_state');
        if (state !== savedState) {
          throw new Error('State parameter mismatch - possible CSRF attack');
        }

        // Exchange code for tokens
        await exchangeCodeForTokens(code);

        // Clear URL parameters for security
        window.history.replaceState({}, document.title, '/');

        // Redirect to dashboard
        window.location.href = '/';
      } catch (err) {
        setError(err.message || 'Authentication failed');
        console.error('Callback error:', err);
        setLoading(false);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="callback-container">
      <div className="callback-card">
        {loading ? (
          <>
            <h1>Authenticating...</h1>
            <p>Please wait while we complete your sign in.</p>
            <div className="loading-spinner"></div>
          </>
        ) : (
          <>
            <h1>Authentication Error</h1>
            <div className="alert-box alert-error">
              <p>{error}</p>
            </div>
            <a href="/signin" className="primary-btn">
              Back to Sign In
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default Callback;
