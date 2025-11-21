import React from 'react';
import { useAuth } from '../AuthMiddleware';
import { logout } from '../oidcService';

const Home = () => {
  const { user, isAuth, loading } = useAuth();
  const [recommendations, setRecommendations] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [apiLoading, setApiLoading] = React.useState(false);

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  const handleLoadRecommendations = async () => {
    setApiLoading(true);
    setError(null);
    setRecommendations(null);

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        'https://z4v1ognu3l.execute-api.eu-central-1.amazonaws.com/api/recommendations',
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      setError(err.message || 'Failed to load recommendations');
      console.error('API error:', err);
    } finally {
      setApiLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      logout();
    } catch (err) {
      console.error('Logout error:', err);
      alert('Logout failed: ' + err.message);
    }
  };

  // Not authenticated - show sign in prompt
  if (!isAuth) {
    return (
      <div className="home-container">
        <div className="auth-prompt">
          <h1>Welcome</h1>
          <p>Please sign in to continue</p>
          <a href="/signin" className="primary-btn">
            Sign In
          </a>
          <span className="divider">or</span>
          <a href="/signup" className="primary-btn">
            Create Account
          </a>
        </div>
      </div>
    );
  }

  // Authenticated - show dashboard
  return (
    <div className="home-container">
      <div className="dashboard">
        <div className="user-header">
          <h1>Dashboard</h1>
          <div className="user-info">
            <span>Welcome, {user?.email || 'User'}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>

        <div className="button-group">
          <button
            className="primary-btn"
            onClick={handleLoadRecommendations}
            disabled={apiLoading}
          >
            {apiLoading ? 'Loading...' : 'Load Recommendations'}
          </button>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {recommendations && (
          <div className="alert-box alert-success">
            <strong>Success:</strong>
            <pre>{JSON.stringify(recommendations, null, 2)}</pre>
          </div>
        )}

        <div className="auth-info">
          <p>
            <strong>Username:</strong> {user?.username || 'N/A'}
          </p>
          <p>
            <strong>Email:</strong> {user?.email || 'N/A'}
          </p>
          <p>
            <strong>Auth Status:</strong> Authenticated
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
