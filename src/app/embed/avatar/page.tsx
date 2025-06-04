// app/embed/avatar/page.tsx
'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function AvatarPage() {
  // Function to run after the page loads
  useEffect(() => {
    // This will run only on the client side after the component mounts
  }, []);

  return (
    <div
      id="app"
      style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <h1>Streaming Avatar Demo</h1>
      <div
        id="yourAvatarContainer"
        className="avatarContainer"
        style={{
          width: '100%',
          height: '400px',
          border: '1px solid #ccc',
          borderRadius: '8px',
        }}
      ></div>

      {/* Load the SDK first */}
      <Script
        src="https://cdn.jsdelivr.net/gh/pigmore/docs/streamingAvatar-min.js"
        strategy="beforeInteractive"
      />

      {/* Then initialize the avatar */}
      <Script id="avatar-init" strategy="afterInteractive">
        {`
          if (typeof window !== 'undefined') {
            ;
            if (typeof StreamingAvatar !== 'undefined') {
              try {
                var myStreamingAvatar = new StreamingAvatar({ 
                  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4MWFkNjNlNmIwZTlkOWI1ZGNlZDgwMiIsInVpZCI6NjQzNzc4OCwiZW1haWwiOiJqaW0uZG9taXFAZ21haWwuY29tIiwiY3JlZGVudGlhbElkIjoiNjgxYjk0NWE2YjBlOWQ5YjVkZTY2ZDEwIiwiZmlyc3ROYW1lIjoiSmltIiwidGVhbV9pZCI6IjY4MWFkNjNlN2JiMjhlNzc3MjA4NmE4MiIsInJvbGVfYWN0aW9ucyI6WzEsMiwzLDQsNSw2LDcsOCw5XSwiaXNfZGVmYXVsdF90ZWFtIjp0cnVlLCJmcm9tIjoidG9PIiwidHlwZSI6InVzZXIiLCJpYXQiOjE3NDY2NDg1MzAsImV4cCI6MjA1NzY4ODUzMH0.aNIpIOE3-UL_Ek_E0k4YY4_ClWe8-20QURS9pUdsh6M",
                  avatarID: 
                });
                ;
                
                // Initialize the avatar in the DOM
                myStreamingAvatar.initDom('yourAvatarContainer');
                ;
                
                // Store reference in window for debugging
                window.myStreamingAvatar = myStreamingAvatar;
              } catch (error) {
                console.error('Error initializing avatar:', error);
              }
            } else {
              console.error('StreamingAvatar not defined. SDK might not be loaded correctly.');
            }
          }
        `}
      </Script>
    </div>
  );
}
