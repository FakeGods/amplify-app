import { withAuthenticator, Button, Alert } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from 'aws-amplify/auth';
import React, { useState } from "react";

function App({ signOut, user }) {
  const API_URL = "https://z4v1ognu3l.execute-api.eu-central-1.amazonaws.com/api";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Authorization": authToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setData(result);
      console.log("API Response:", result);
    } catch (err) {
      const errorMsg = err.message || "Failed to fetch from API";
      setError(errorMsg);
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>Welcome, {user.username}!</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <Button variation="primary" onClick={fetchRecommendations} disabled={loading}>
          {loading ? "Loading..." : "Load Recommendations"}
        </Button>
        <Button variation="warning" onClick={signOut} style={{ marginLeft: "10px" }}>
          Sign Out
        </Button>
      </div>

      {error && <Alert variation="error">{error}</Alert>}
      {data && (
        <Alert variation="success">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </Alert>
      )}
    </div>
  );
}

export default withAuthenticator(App);