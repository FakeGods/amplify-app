import React, { useState } from 'react';
import { getAuthorizationUrl } from '../oidcService';

const SignUp = () => {
  const [error, setError] = useState(null);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      // Cognito Hosted UI does not accept `prompt=signup` (invalid_prompt).
      // Request a normal authorization URL and let the Hosted UI show sign-up option.
      const authUrl = await getAuthorizationUrl();
      console.log('Redirecting to signup (no prompt):', authUrl);
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
        <p className="signup-subtitle">Join us today</p>

        {error && (
          <div className="alert-box alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSignUp}>
          <p className="signup-info">
            We use Cognito's secure authentication. Click below to create your account.
          </p>

          <button type="submit" className="primary-btn signup-btn">
            Create Account with Cognito
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{' '}
            <a href="/signin" className="auth-link">
              Sign in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
