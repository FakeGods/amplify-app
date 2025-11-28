import React, { useState } from 'react';
import { getAuthorizationUrl } from '../oidcService';

const SignUp = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Use Cognito Hosted UI for signup
      // The hosted UI will show the signup form when users don't have an account
      const authUrl = await getAuthorizationUrl();
      
      // Redirect to Cognito Hosted UI
      // Users can click "Sign up" link on the login page
      window.location.href = authUrl;
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to initiate sign up');
      setLoading(false);
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

        <div className="signup-info" style={{ marginBottom: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            You'll be redirected to our secure authentication page. 
            Click <strong>"Sign up"</strong> on the login page to create a new account.
          </p>
        </div>

        <form onSubmit={handleSignUp}>
          <button 
            type="submit" 
            className="primary-btn signup-btn" 
            disabled={loading}
          >
            {loading ? 'Redirecting...' : 'Continue to Sign Up'}
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
