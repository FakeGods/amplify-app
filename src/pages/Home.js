import React from 'react';
import { useAuth } from '../AuthMiddleware';
import { logout } from '../oidcService';
import { getApiUrl, config } from '../config';

const Home = () => {
  const { user, isAuth, loading } = useAuth();
  const [recommendations, setRecommendations] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [apiLoading, setApiLoading] = React.useState(false);
  const [feedback, setFeedback] = React.useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = React.useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState(null);

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
      // Get the ID token from localStorage (stored by oidcService)
      const authToken = localStorage.getItem('id_token');
      
      if (!authToken) {
        throw new Error('No authentication token available. Please sign in again.');
      }

      const apiUrl = getApiUrl(config.API_PATHS.recommendations);
      
      console.log('Calling API:', apiUrl);
      console.log('Using token:', authToken ? 'Token present' : 'No token');
      console.log('Token preview:', authToken ? authToken.substring(0, 50) + '...' : 'N/A');
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('API response data:', data);
      setRecommendations(data);
    } catch (err) {
      console.error('Full error details:', err);
      setError(err.message || 'Failed to load recommendations');
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

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setError(null);
    setFeedbackSuccess(null);

    try {
      const authToken = localStorage.getItem('id_token');
      
      if (!authToken) {
        throw new Error('No authentication token available. Please sign in again.');
      }

      if (!feedback.trim()) {
        throw new Error('Please enter some feedback');
      }

      const apiUrl = getApiUrl(config.API_PATHS.feedback);
      
      console.log('Submitting feedback to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ feedback: feedback.trim() }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Feedback submission response:', data);
      setFeedbackSuccess('Feedback submitted successfully! Recommendations are being generated...');
      setFeedback('');
      
      // Auto-refresh recommendations after 5 seconds
      setTimeout(() => {
        handleLoadRecommendations();
      }, 5000);
    } catch (err) {
      console.error('Feedback submission error:', err);
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const handleDeleteRecommendations = async () => {
    if (!window.confirm('Are you sure you want to delete all recommendations?')) {
      return;
    }

    setApiLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('id_token');
      
      if (!authToken) {
        throw new Error('No authentication token available. Please sign in again.');
      }

      const apiUrl = getApiUrl(config.API_PATHS.recommendations);
      
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Delete response:', data);
      setRecommendations(null);
      alert(data.message || 'Recommendations deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err.message || 'Failed to delete recommendations');
    } finally {
      setApiLoading(false);
    }
  };

  // Not authenticated - show sign in prompt
  if (!isAuth) {
    return (
      <div className="home-container">
        <div className="auth-prompt">
          <h1>Witam Szefa</h1>
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
          <h1>Witam Szefa</h1>
          <div className="user-info">
            <span>Welcome, {user?.username || user?.email || 'User'}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Feedback Submission Form */}
        <div className="feedback-section">
          <h2>Submit Feedback</h2>
          <form onSubmit={handleSubmitFeedback}>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Enter your feedback here... AI will generate recommendations based on your input."
              rows="4"
              disabled={feedbackSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
                fontSize: '14px',
              }}
            />
            <div className="button-group">
              <button
                type="submit"
                className="primary-btn"
                disabled={feedbackSubmitting || !feedback.trim()}
              >
                {feedbackSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>
            </div>
          </form>
        </div>

        {feedbackSuccess && (
          <div className="alert-box alert-success">
            <strong>Success:</strong> {feedbackSuccess}
          </div>
        )}

        {/* Recommendations Section */}
        <div className="recommendations-section">
          <h2>Your Recommendations</h2>
          <div className="button-group">
            <button
              className="primary-btn"
              onClick={handleLoadRecommendations}
              disabled={apiLoading}
            >
              {apiLoading ? 'Loading...' : 'Load Recommendations'}
            </button>
            {recommendations && recommendations.count > 0 && (
              <button
                className="primary-btn"
                onClick={handleDeleteRecommendations}
                disabled={apiLoading}
                style={{ backgroundColor: '#dc3545' }}
              >
                Delete All
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="alert-box alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {recommendations && (
          <div className="recommendations-display">
            <h3>Recommendations ({recommendations.count})</h3>
            {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
              recommendations.recommendations.map((item, index) => (
                <div key={index} className="recommendation-item" style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  backgroundColor: '#f9f9f9',
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Feedback:</strong> {item.originalFeedback}
                  </div>
                  <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                    <strong>Generated:</strong> {new Date(item.generatedAt).toLocaleString()}
                  </div>
                  {item.recommendations && item.recommendations.map((rec, recIndex) => (
                    <div key={recIndex} style={{
                      border: '1px solid #667eea',
                      borderRadius: '6px',
                      padding: '12px',
                      marginTop: '10px',
                      backgroundColor: 'white',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, color: '#667eea' }}>{rec.title}</h4>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontWeight: 'bold',
                          backgroundColor: rec.priority === 'high' ? '#dc3545' : rec.priority === 'medium' ? '#ffc107' : '#28a745',
                          color: 'white',
                        }}>
                          {rec.priority?.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ margin: '8px 0', color: '#333' }}>{rec.description}</p>
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        <strong>Category:</strong> {rec.category}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <p>No recommendations available.</p>
            )}
          </div>
        )}

        <div className="auth-info">
          <p>
            <strong>Name:</strong> {user?.username || user?.name || 'N/A'}
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
