import React, { useState } from 'react';
import { getAuthorizationUrl } from '../oidcService';

const SignIn = () => {
  const [error, setError] = useState(null);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const authUrl = await getAuthorizationUrl();
      console.log('Auth URL:', authUrl);
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message || 'Failed to initiate sign in');
      console.error('Sign in error:', err);
    }
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h1>Sign In</h1>
        <p className="signin-subtitle">Access your account</p>

        {error && (
          <div className="alert-box alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSignIn}>
          <button type="submit" className="primary-btn signin-btn">
            Sign In with Cognito
          </button>
        </form>

        <div className="signin-footer">
          <p>
            Don't have an account?{' '}
            <a href="/signup" className="auth-link">
              Create one
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
