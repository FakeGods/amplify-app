import React, { useState } from 'react';
import { getAuthorizationUrl } from '../oidcService';

/**
 * SignUp component - User registration page
 * Uses Cognito's hosted UI for registration
 */
import React, { useState } from 'react';
import { getAuthorizationUrl } from '../oidcService';

/**
 * SignUp component - User registration page
 * Uses Cognito's hosted UI for registration
 */
const SignUp = () => {
  const [error, setError] = useState(null);

  const handleSignUp = (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Signup uses the hosted UI with prompt=signup
      const authUrl = getAuthorizationUrl({ prompt: 'signup' });
      window.location.href = authUrl;
    } catch (err) {
      setError(err.message || 'Failed to initiate sign up');
      console.error('Sign up error:', err);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1>Create Account</h1>
        <p className="signup-subtitle">Start your free account</p>

        {error && (
          <div className="alert-box alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <button type="submit" className="primary-btn signup-btn">
            Sign Up with Cognito
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <a href="/signin" className="auth-link">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
