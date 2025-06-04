import { HumanMessage } from '@langchain/core/messages';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';

const togetherLLM = new ChatTogetherAI({
  model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
  temperature: 0,
  apiKey: 'tgp_v1_pByLlejWifHS818GSmioLrt9G0jkXWhbmKLL7IMcEaI',
  // apiKey: process.env.TOGETHER_API_KEY,
});

export async function classifyUIHint(
  question: string,
): Promise<{ type: string; options?: string[] }> {
  const systemPrompt = `
You're a UI assistant. Given a question, return a minimal JSON describing the input type:

- Yes/No → { "type": "buttons", "options": ["Yes", "No"] }
- 1/2/3 style → { "type": "buttons", "options": ["1", "2", "3"] }
- Date → { "type": "calendar" }
- Free text → { "type": "input" }

Respond with ONLY the JSON.
`;

  const res = await togetherLLM.invoke([
    new HumanMessage(`Question: "${question}"\n\n${systemPrompt}`),
  ]);

  const raw = typeof res.content === 'string' ? res.content : (res.content?.toString?.() ?? '');

  try {
    return JSON.parse(raw.trim());
  } catch {
    return { type: 'input' }; // fallback
  }
}
