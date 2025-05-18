// src/app/api/conversations/route.ts

export async function GET() {
  const res = await fetch("https://api.elevenlabs.io/v1/conversations", {
    headers: {
      "xi-api-key": process.env.ELEVENLABS_API_KEY!,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return Response.json(data);
}
