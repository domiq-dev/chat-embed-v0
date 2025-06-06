export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Your Next.js server calls the LLM (no CORS restrictions)
    const response = await fetch('http://3.16.255.36:8001/chat/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    // Pass streaming response back to frontend
    return response;
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Error', { status: 500 });
  }
}
