import { NextResponse } from 'next/server';

async function getAkoolToken() {
  const clientId = process.env.AKOOL_CLIENT_ID;
  const clientSecret = process.env.AKOOL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing Akool Client ID or Client Secret');
  }

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
    throw new Error(responseData.message || 'Failed to fetch Akool access token');
  }

  return responseData.token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    console.log(`[CLOSE] Attempting to close AKOOL session: ${id}`);

    // Get proper AKOOL token
    const token = await getAkoolToken();
    console.log(`[CLOSE] Token acquired successfully for session: ${id}`);
    
    const response = await fetch('https://openapi.akool.com/api/open/v4/liveAvatar/session/close', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    const responseData = await response.json();
    console.log(`[CLOSE] AKOOL response for session ${id}:`, responseData);
    
    if (responseData.code === 1000) {
      console.log(`[CLOSE] ✅ Successfully closed AKOOL session: ${id}`);
      return NextResponse.json({ success: true });
    } else {
      console.error(`[CLOSE] ❌ Failed to close AKOOL session ${id}:`, responseData);
      
      // Handle specific error cases
      if (responseData.msg?.includes('unavailable')) {
        console.log(`[CLOSE] 🚨 AKOOL server unavailable for session ${id} - treating as success`);
        // Return success since we can't do anything about server availability
        return NextResponse.json({ 
          success: true, 
          warning: 'Server unavailable, session may auto-expire' 
        });
      }
      
      return NextResponse.json(
        { 
          error: responseData.msg || 'Failed to close session',
          code: responseData.code,
          sessionId: id
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error(`[CLOSE] 💥 Exception in session close endpoint:`, error);
    
    // If it's a network error or server unavailable, treat as non-fatal
    if (error.message?.includes('fetch') || error.message?.includes('unavailable')) {
      console.log(`[CLOSE] 🔄 Network/server issue - treating as success`);
      return NextResponse.json({ 
        success: true, 
        warning: 'Network issue, session may auto-expire' 
      });
    }
    
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
} 