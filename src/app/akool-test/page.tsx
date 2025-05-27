'use client';

import AkoolAvatar from '@/components/AkoolAvatar';

const AkoolTestPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Akool Avatar Test Page</h1>
      <p>
        This page attempts to fetch an Akool access token via an API route
        and then display it. If successful, the token will be shown below.
        The next step will be to use this token with Agora to render the avatar.
      </p>
      <hr style={{ margin: '20px 0' }} />
      <AkoolAvatar />
    </div>
  );
};

export default AkoolTestPage; 