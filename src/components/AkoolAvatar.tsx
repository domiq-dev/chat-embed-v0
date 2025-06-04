'use client';

import { useEffect, useState } from 'react';

interface AkoolTokenApiResponse {
  code?: number;
  token?: string;
  message?: string; // For error messages from Akool API
  [key: string]: any;
}

const AkoolAvatar = () => {
  const [apiResponse, setApiResponse] = useState<AkoolTokenApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchToken = async () => {
      setIsLoading(true);
      setError(null); // Reset error on new fetch attempt
      try {
        const response = await fetch('/api/akool-token');
        const data: AkoolTokenApiResponse = await response.json();
        setApiResponse(data);

        if (!response.ok) {
          // Error came from our API route (e.g., missing env vars, or our route's internal error)
          throw new Error(data.error || 'Failed to fetch token via local API route');
        } else if (data.code !== 1000) {
          // Error came from Akool API itself (e.g., invalid client ID/secret)
          setError(data.message || `Akool API returned error code: ${data.code}`);
        } else if (!data.token) {
          // Akool API said success (code 1000) but no token was found
          setError('Access token not found in Akool API response despite success code.');
        }
        // If we reach here and data.code === 1000 and data.token exists, it's a success.
      } catch (err: any) {
        console.error('AkoolAvatar component error:', err);
        setError(err.message || 'An unknown error occurred');
      }
      setIsLoading(false);
    };

    fetchToken();
  }, []);

  if (isLoading) {
    return <p>Loading Akool Token...</p>;
  }

  // Display error if any occurred during fetch or from Akool API
  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Error: {error}</p>
        {apiResponse && (
          <pre
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              background: '#f0f0f0',
              border: '1px solid #ccc',
              padding: '10px',
            }}
          >
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        )}
      </div>
    );
  }

  // Display token if successfully fetched
  if (apiResponse && apiResponse.code === 1000 && apiResponse.token) {
    return (
      <div>
        <h2>Akool Avatar Placeholder</h2>
        <p>Access Token: {apiResponse.token}</p>
        {/* The new API doesn't seem to return an 'expire' field for the token itself, but notes it's valid for >1 year */}
        <hr />
        <p>Full API Response:</p>
        <pre
          style={{
            maxHeight: '200px',
            overflowY: 'auto',
            background: '#f0f0f0',
            border: '1px solid #ccc',
            padding: '10px',
          }}
        >
          {JSON.stringify(apiResponse, null, 2)}
        </pre>
        {/* Agora and Akool video avatar integration will go here */}
      </div>
    );
  }

  // Fallback for unexpected state (should ideally be covered by isLoading or error states)
  return (
    <div style={{ color: 'orange' }}>
      <p>An unexpected state occurred. Akool token might not be available.</p>
      {apiResponse && <pre>{JSON.stringify(apiResponse, null, 2)}</pre>}
    </div>
  );
};

export default AkoolAvatar;
