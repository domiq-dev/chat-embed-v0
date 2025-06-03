// app/api/avatar/session/route.ts
import { NextResponse } from 'next/server';

// Environment variables for API credentials
// Store these securely in your .env.local file
const AKOOL_CLIENT_ID = process.env.AKOOL_CLIENT_ID
const AKOOL_SECRET_KEY = process.env.AKOOL_SECRET_KEY

// Types for API responses
interface AvatarSessionResponse {
  code: number;
  msg: string;
  data: {
    _id: string;
    uid: number;
    type: number;
    status: number;
    stream_type: string;
    credentials: {
      agora_uid: number;
      agora_app_id: string;
      agora_channel: string;
      agora_token: string;
    };
  };
}

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { avatarId } = body;

    if (!avatarId) {
      return NextResponse.json(
        { error: 'Avatar ID is required' },
        { status: 400 }
      );
    }

    // Create Akool avatar session
    const sessionResponse = await createAvatarSession(avatarId);

    if (sessionResponse.code !== 1000) {
      return NextResponse.json(
        { error: sessionResponse.msg || 'Failed to create avatar session' },
        { status: 500 }
      );
    }

    // Return only necessary data to client
    return NextResponse.json({
      sessionId: sessionResponse.data._id,
      credentials: sessionResponse.data.credentials,
    });
  } catch (error: any) {
    console.error('Error creating avatar session:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

async function createAvatarSession(avatarId: string): Promise<AvatarSessionResponse> {
  const url = 'https://openapi.akool.com/api/open/v4/liveAvatar/session/create';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AKOOL_CLIENT_ID}:${AKOOL_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      avatar_id: avatarId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create avatar session: ${response.statusText}`);
  }

  return response.json();
}

// Endpoint to close the session when done
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const closeResponse = await closeAvatarSession(sessionId);

    if (closeResponse.code !== 1000) {
      return NextResponse.json(
        { error: closeResponse.msg || 'Failed to close avatar session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error closing avatar session:', error);
    return NextResponse.json(
      { error: error.message || 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

async function closeAvatarSession(sessionId: string): Promise<any> {
  const url = 'https://openapi.akool.com/api/open/v4/liveAvatar/session/close';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AKOOL_CLIENT_ID}:${AKOOL_SECRET_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: sessionId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to close avatar session: ${response.statusText}`);
  }

  return response.json();
}