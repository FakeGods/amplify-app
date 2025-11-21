import React from 'react';
import { oidcConfig } from '../oidcConfig';
import { getAuthorizationUrl } from '../oidcService';

const Debug = () => {
  const authUrl = getAuthorizationUrl();
  
  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>OIDC Configuration Debug</h1>
      
      <h2>Config Values:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
        {JSON.stringify({
          region: oidcConfig.region,
          userPoolId: oidcConfig.userPoolId,
          clientId: oidcConfig.clientId,
          cognitoDomain: oidcConfig.cognitoDomain,
          redirectUri: oidcConfig.redirectUri,
          authorizationEndpoint: oidcConfig.authorizationEndpoint,
        }, null, 2)}
      </pre>

      <h2>Generated Authorization URL:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflowX: 'auto', wordBreak: 'break-all' }}>
        {authUrl}
      </pre>

      <h2>Session Storage:</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px' }}>
        {JSON.stringify({
          nonce: sessionStorage.getItem('oidc_nonce'),
          state: sessionStorage.getItem('oidc_state'),
        }, null, 2)}
      </pre>

      <button onClick={() => window.location.href = authUrl}>
        Test Authorization Flow
      </button>
    </div>
  );
};

export default Debug;
