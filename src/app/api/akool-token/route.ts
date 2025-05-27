import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.AKOOL_CLIENT_ID;
  const clientSecret = process.env.AKOOL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: 'Missing Akool Client ID or Client Secret' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch('https://openapi.akool.com/api/open/v3/getToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientId,
        clientSecret,
      }),
    });

    const responseData = await response.json();

    if (!response.ok || responseData.code !== 1000) {
      console.error('Akool API error:', responseData);
      return NextResponse.json(
        { 
          error: responseData.message || 'Failed to fetch Akool access token', 
          details: responseData 
        },
        { status: response.status } // Or a more specific error code based on responseData.code if available
      );
    }
    
    // According to new docs, token is directly in responseData.token
    return NextResponse.json({ 
      code: responseData.code, 
      token: responseData.token 
      // Add other fields from responseData if needed, like expiry if it exists
    });

  } catch (error: any) {
    console.error('Error fetching Akool token:', error);
    // Check if it's a fetch error (e.g., DNS resolution, network issue)
    if (error.cause && error.cause.code === 'ENOTFOUND') {
      return NextResponse.json(
        { error: `DNS lookup failed for ${error.cause.hostname}. Please check network connectivity and domain name.` },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error while fetching Akool token', details: error.message },
      { status: 500 }
    );
  }
} 