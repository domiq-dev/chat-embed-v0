import { NextResponse } from 'next/server';

const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!;
const apiKey = process.env.ELEVENLABS_API_KEY!;

async function fetchAllConversations(agentId: string, apiKey: string) {
  let all: any[] = [];
  let cursor = '';
  let hasMore = true;

  while (hasMore) {
    const url = new URL('https://api.elevenlabs.io/v1/convai/conversations');
    url.searchParams.set('agent_id', agentId);
    if (cursor) url.searchParams.set('cursor', cursor);

    const res = await fetch(url.toString(), {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const error = await res.text();
      console.error('❌ Error from ElevenLabs:', error);
      throw new Error('Failed to fetch conversations');
    }

    const data = await res.json();
    all.push(...data.conversations);
    hasMore = data.has_more;
    cursor = data.next_cursor || '';
  }

  return all;
}

export async function GET() {
  try {
    const conversations = await fetchAllConversations(agentId, apiKey);

    const successfulCalls = conversations.filter(
      (c) => c.call_duration_secs && c.call_duration_secs > 0,
    );

    const durations = successfulCalls.map((c) => c.call_duration_secs || 0);
    const messageCounts = successfulCalls.map((c) => c.message_count || 0);

    const median = (arr: number[]) => {
      if (!arr.length) return 0;
      const sorted = [...arr].sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    };

    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / (arr.length || 1);

    return NextResponse.json({
      callCount: successfulCalls.length,
      medianDuration: Math.round(median(durations)),
      avgDuration: Math.round(avg(durations)),
      avgMessagesPerCall: Math.round(avg(messageCounts)),
    });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
