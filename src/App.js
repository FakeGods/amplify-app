import { withAuthenticator, Button, TextField, Table, TableCell, TableBody, TableRow, TableHead, Alert } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { fetchAuthSession } from 'aws-amplify/auth';
import React, { useState } from "react";

function App({ signOut, user }) {
  const TEST_URL = "";


  const fetchRecommendations = async () => {
    try {
      const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();

      const response = await fetch(TEST_URL, {
        method: "GET",
        headers: {
          Authorization: authToken,
        },
      });

      const data = await response.json();

      console.log("Data")
      console.log(data)
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
    }
  };

  return (
    <div className="App">
      <h1>Hello {user.username}</h1>
      <Button variation="primary" onClick={signOut}>Sign out</Button>
      <Button variation="primary" onClick={fetchRecommendations}>Load Recommendations</Button>
    </div>
  );
}

export default withAuthenticator(App);