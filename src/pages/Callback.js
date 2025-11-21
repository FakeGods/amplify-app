import React, { useEffect, useState } from 'react';
import { exchangeCodeForTokens } from '../oidcService';

const Callback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const error = params.get('error');
        const errorDescription = params.get('error_description');

        console.log('Callback URL params:', {
          code,
          state,
          error,
          errorDescription,
          fullUrl: window.location.href,
          allParams: Object.fromEntries(params),
        });

        if (error) {
          throw new Error(`Cognito error: ${error} - ${errorDescription || 'Unknown error'}`);
        }

        if (!code) {
          throw new Error('No authorization code received');
        }

        const savedState = sessionStorage.getItem('oidc_state');
        if (state !== savedState) {
          throw new Error('State parameter mismatch - possible CSRF attack');
        }

        await exchangeCodeForTokens(code);

        window.history.replaceState({}, document.title, '/');
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
