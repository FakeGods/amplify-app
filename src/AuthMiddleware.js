import React, { useState, useEffect } from 'react';
import { isAuthenticated, getAccessToken } from './oidcService';

/**
 * ProtectedRoute component that checks authentication before rendering
 * Redirects to login if user is not authenticated
 */
export const ProtectedRoute = ({ component: Component, loginComponent: LoginComponent, ...props }) => {
  const [authenticated, setAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const isAuth = isAuthenticated();
      setAuthenticated(isAuth);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="auth-loading">
        <p>Loading authentication status...</p>
      </div>
    );
  }

  return authenticated ? <Component {...props} /> : <LoginComponent {...props} />;
};

/**
 * AuthContext to manage authentication state globally
 */
const AuthContext = React.createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const authenticated = isAuthenticated();
        setIsAuth(authenticated);

        if (authenticated) {
          // Get ID token from localStorage
          const idToken = localStorage.getItem('id_token');
          
          if (idToken) {
            const payload = parseJwt(idToken);
            
            // Extract user info from ID token claims
            const email = payload.email || 'N/A';
            const cognitoUsername = payload['cognito:username'];
            // Check for 'name' attribute first, then username, then fallback
            const displayName = payload.name || cognitoUsername || email.split('@')[0];
            
            // Capitalize first letter
            const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            
            setUser({
              email: email,
              username: formattedName,
              sub: payload.sub,
              name: formattedName,
              cognitoUsername: cognitoUsername,
            });
            
            console.log('User info from ID token:', { 
              email, 
              username: formattedName, 
              cognitoUsername,
              rawName: displayName,
              allClaims: payload 
            });
          } else {
            console.warn('No ID token found in localStorage');
            setUser({
              email: 'N/A',
              username: 'User',
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuth(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuthentication();

    // Re-check authentication every 5 minutes
    const interval = setInterval(checkAuthentication, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const value = {
    user,
    isAuth,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to use authentication context
 */
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
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
 * withAuth Higher-Order Component for class components
 */
export const withAuth = (Component) => {
  return (props) => {
    const auth = useAuth();

    if (auth.loading) {
      return (
        <div className="auth-loading">
          <p>Loading authentication status...</p>
        </div>
      );
    }

    if (!auth.isAuth) {
      return (
        <div className="auth-error">
          <p>You must be logged in to access this page.</p>
        </div>
      );
    }

    return <Component {...props} auth={auth} />;
  };
};

/**
 * AuthGuard component - renders children only if authenticated
 */
export const AuthGuard = ({ children, fallback = null }) => {
  const auth = useAuth();

  if (auth.loading) {
    return fallback || <div className="auth-loading"><p>Loading...</p></div>;
  }

  if (!auth.isAuth) {
    return fallback || <div className="auth-error"><p>Authentication required</p></div>;
  }

  return children;
};

/**
 * RequireAuth component - simple wrapper for protected content
 */
export const RequireAuth = ({ children }) => {
  const auth = useAuth();

  if (!auth.isAuth) {
    return null;
  }

  return children;
};

/**
 * ShowIfAuth component - conditionally render content if authenticated
 */
export const ShowIfAuth = ({ children, fallback = null }) => {
  const auth = useAuth();

  return auth.isAuth ? children : fallback;
};

/**
 * ShowIfNotAuth component - conditionally render content if NOT authenticated
 */
export const ShowIfNotAuth = ({ children, fallback = null }) => {
  const auth = useAuth();

  return !auth.isAuth ? children : fallback;
};
