import { NextResponse } from "next/server";

const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID!;
const apiKey = process.env.ELEVENLABS_API_KEY!;

export async function GET() {
  try {
    // Fetch all calls (paginated)
    const fetchAll = async () => {
      let all: any[] = [];
      let cursor = "";
      let hasMore = true;

      while (hasMore) {
        const url = new URL("https://api.elevenlabs.io/v1/convai/conversations");
        url.searchParams.set("agent_id", agentId);
        if (cursor) url.searchParams.set("cursor", cursor);

        const res = await fetch(url.toString(), {
          headers: {
            "xi-api-key": apiKey,
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        all.push(...data.conversations);
        hasMore = data.has_more;
        cursor = data.next_cursor || "";
      }

      return all;
    };

    const conversations = await fetchAll();

    // Format and group by date
    const callsByDay: Record<string, number> = {};

    conversations.forEach((conv) => {
      if (!conv.start_time_unix_secs || !conv.call_duration_secs) return;

      const date = new Date(conv.start_time_unix_secs * 1000)
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
        });

      if (!callsByDay[date]) callsByDay[date] = 0;
      callsByDay[date]++;
    });

    const formattedData = Object.entries(callsByDay)
      .map(([date, calls]) => ({ date, calls }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(formattedData);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
