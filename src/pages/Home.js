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
  const [tags, setTags] = React.useState('');
  const [feedbackSubmitting, setFeedbackSubmitting] = React.useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState(null);
  const [editingRecommendation, setEditingRecommendation] = React.useState(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchTags, setSearchTags] = React.useState('');
  const [showCompleted, setShowCompleted] = React.useState('all');

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
        body: JSON.stringify({ 
          feedback: feedback.trim(),
          tags: tags.trim() ? tags.split(',').map(t => t.trim()).filter(t => t) : [],
        }),
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
      setTags('');
      
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

  const handleToggleCompleted = async (timestamp, currentStatus) => {
    try {
      const authToken = localStorage.getItem('id_token');
      
      if (!authToken) {
        throw new Error('No authentication token available.');
      }

      const apiUrl = `${config.API_ENDPOINT}/recommendations/${timestamp}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !currentStatus }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Refresh recommendations
      handleLoadRecommendations();
    } catch (err) {
      console.error('Toggle completion error:', err);
      setError(err.message || 'Failed to update completion status');
    }
  };

  const handleEditRecommendation = (item) => {
    setEditingRecommendation({
      timestamp: item.timestamp,
      tags: item.tags || [],
      completed: item.completed || false,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRecommendation) return;

    try {
      const authToken = localStorage.getItem('id_token');
      
      if (!authToken) {
        throw new Error('No authentication token available.');
      }

      const apiUrl = `${config.API_ENDPOINT}/recommendations/${editingRecommendation.timestamp}`;
      
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': authToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tags: editingRecommendation.tags,
          completed: editingRecommendation.completed,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      setEditingRecommendation(null);
      handleLoadRecommendations();
    } catch (err) {
      console.error('Save edit error:', err);
      setError(err.message || 'Failed to save changes');
    }
  };

  const handleSearch = async () => {
    setApiLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem('id_token');
      
      if (!authToken) {
        throw new Error('No authentication token available.');
      }

      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (searchTags.trim()) params.append('tags', searchTags.trim());
      if (showCompleted !== 'all') params.append('completed', showCompleted);

      const apiUrl = `${config.API_ENDPOINT}/recommendations/search?${params.toString()}`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
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
      setRecommendations(data);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to search recommendations');
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

        {/* Auth Info Section */}
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
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Tags (comma-separated, e.g., bug, feature, urgent)"
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
          
          {/* Search Section */}
          <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
            <h3 style={{ marginTop: 0 }}>Search & Filter</h3>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search recommendations..."
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
            <input
              type="text"
              value={searchTags}
              onChange={(e) => setSearchTags(e.target.value)}
              placeholder="Filter by tags (comma-separated)"
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
            <select
              value={showCompleted}
              onChange={(e) => setShowCompleted(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                marginBottom: '10px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            >
              <option value="all">All Recommendations</option>
              <option value="true">Completed Only</option>
              <option value="false">Not Completed</option>
            </select>
            <button
              className="primary-btn"
              onClick={handleSearch}
              disabled={apiLoading}
              style={{ marginRight: '10px' }}
            >
              {apiLoading ? 'Searching...' : 'Search'}
            </button>
            <button
              className="primary-btn"
              onClick={() => {
                setSearchQuery('');
                setSearchTags('');
                setShowCompleted('all');
                handleLoadRecommendations();
              }}
              disabled={apiLoading}
              style={{ backgroundColor: '#6c757d' }}
            >
              Clear Filters
            </button>
          </div>
          
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
                  border: item.completed ? '2px solid #28a745' : '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  backgroundColor: item.completed ? '#f0fff4' : '#f9f9f9',
                  position: 'relative',
                }}>
                  {/* Edit/Completed Controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={item.completed || false}
                          onChange={() => handleToggleCompleted(item.timestamp, item.completed)}
                          style={{ marginRight: '8px', width: '18px', height: '18px' }}
                        />
                        <span style={{ fontWeight: 'bold', color: item.completed ? '#28a745' : '#666' }}>
                          {item.completed ? 'Completed' : 'Mark as Completed'}
                        </span>
                      </label>
                    </div>
                    <button
                      onClick={() => handleEditRecommendation(item)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px',
                      }}
                    >
                      Edit Tags
                    </button>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <strong>Feedback:</strong> {item.originalFeedback}
                  </div>
                  
                  {/* Tags Display */}
                  {item.tags && item.tags.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Tags:</strong> {' '}
                      {item.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          margin: '0 4px 4px 0',
                          backgroundColor: '#667eea',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '11px',
                        }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                    <strong>Generated:</strong> {new Date(item.generatedAt).toLocaleString()}
                    {item.updatedAt && item.updatedAt !== item.generatedAt && (
                      <> • <strong>Updated:</strong> {new Date(item.updatedAt).toLocaleString()}</>
                    )}
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

        {/* Edit Modal */}
        {editingRecommendation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '30px',
              borderRadius: '12px',
              maxWidth: '500px',
              width: '90%',
            }}>
              <h3 style={{ marginTop: 0 }}>Edit Recommendation</h3>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Tags (comma-separated):
                </label>
                <input
                  type="text"
                  value={editingRecommendation.tags.join(', ')}
                  onChange={(e) => setEditingRecommendation({
                    ...editingRecommendation,
                    tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                  })}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={editingRecommendation.completed}
                    onChange={(e) => setEditingRecommendation({
                      ...editingRecommendation,
                      completed: e.target.checked
                    })}
                    style={{ marginRight: '8px', width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: 'bold' }}>Mark as Completed</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingRecommendation(null)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
