import { NextResponse } from 'next/server';

async function getAkoolToken(): Promise<string> {
  const clientId = process.env.AKOOL_CLIENT_ID;
  const clientSecret = process.env.AKOOL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('AKOOL credentials not found in environment variables');
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

  if (!response.ok) {
    throw new Error(`Failed to get AKOOL token: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.code !== 1000) {
    throw new Error(`AKOOL token error: ${data.message || 'Unknown error'}`);
  }

  return data.token;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, avatar_id, force } = body;

    // Handle force-close-all requests (simplified)
    if (id === 'force-close-all') {
      ;
      
      // Just clear local data - don't overcomplicate with server calls
      const response = NextResponse.json({ 
        success: true, 
        message: 'Local sessions cleared - avatar should be available' 
      });
      
      return response;
    }

    if (!id) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    ;

    // Get proper AKOOL token
    const token = await getAkoolToken();
    ;
    
    const response = await fetch('https://openapi.akool.com/api/open/v4/liveAvatar/session/close', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    const responseData = await response.json();
    ;
    
    if (responseData.code === 1000) {
      ;
      return NextResponse.json({ success: true });
    } else {
      console.error(`[CLOSE] ❌ Failed to close AKOOL session ${id}:`, responseData);
      
      // Handle specific error cases gracefully
      if (responseData.message?.includes('unavailable') || responseData.msg?.includes('unavailable')) {
        ;
        return NextResponse.json({ 
          success: true, 
          warning: 'Server unavailable, session may auto-expire' 
        });
      }
      
      return NextResponse.json(
        { 
          error: responseData.message || responseData.msg || 'Failed to close session',
          code: responseData.code,
          sessionId: id
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[CLOSE] ❌ Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 