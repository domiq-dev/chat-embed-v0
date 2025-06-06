// app/api/agent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Message as VercelChatMessage } from 'ai';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { ChatTogetherAI } from '@langchain/community/chat_models/togetherai';
import { Calculator } from '@langchain/community/tools/calculator';
import {
  AIMessage,
  BaseMessage,
  ChatMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { getDefaultPromptAgent } from '../prompt';
import { showFAQTool, bookTourTool } from '../tools';
import {
  getOrCreateUser,
  updateUser,
  saveMessage,
  getConversation,
  UserData,
  supabase,
} from '@/lib/supabaseClient';

export const runtime = 'nodejs';
const Model_Name = 'Qwen/Qwen2.5-72B-Instruct-Turbo';
const Evaluation_Model = 'Qwen/Qwen2.5-72B-Instruct-Turbo'; // Smaller model for conversation analysis

// Helper to convert between message formats
const convertVercelMessageToLangChainMessage = (message: VercelChatMessage) => {
  if (message.role === 'user') {
    return new HumanMessage(message.content);
  } else if (message.role === 'assistant') {
    return new AIMessage(message.content);
  } else {
    return new ChatMessage(message.content, message.role);
  }
};

const convertLangChainMessageToVercelMessage = (message: BaseMessage) => {
  if (message.getType() === 'human') {
    return { content: message.content, role: 'user' };
  } else if (message.getType() === 'ai') {
    return {
      content: message.content,
      role: 'assistant',
      tool_calls: (message as AIMessage).tool_calls,
    };
  } else {
    return { content: message.content, role: message.getType() };
  }
};

// Function to analyze conversation history using a small LLM
async function analyzeConversation(messages: VercelChatMessage[]): Promise<{
  basicInfo: {
    full_name: string;
    preferred_name: string;
    apt_size: string;
    move_in_date: string;
  };
  qualificationInfo: {
    age: boolean | null;
    income: boolean | null;
    eviction: boolean | null;
  };
  isQualified: boolean;
  question_type: string | null;
}> {
  try {
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      throw new Error('TOGETHER_API_KEY is not configured');
    }

    const evaluator = new ChatTogetherAI({
      model: Evaluation_Model,
      temperature: 0,
      apiKey,
    });

    // Format conversation for analysis
    const conversationText = messages
      .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');

    const prompt = `
    Analyze this apartment leasing conversation history and extract:

    ${conversationText}
    Return a JSON object with:
    1. basicInfo: Extract user's full_name, preferred_name, apt_size (bedroom size), move_in_date
    2. qualificationInfo: 
    - age: true only if user **explicitly confirms** they are over 20
    - income: true only if user **explicitly confirms** they meet the $3600 monthly income
    - eviction: false only if user **explicitly confirms** no prior evictions
    If any answer is missing, set to null
    3. isQualified: boolean (true ONLY if the user has explicitly answered all three qualification questions:
   - age: must be confirmed true
   - income: must be confirmed true
   - eviction: must be confirmed false
   If any of these are missing or uncertain, set isQualified to false.)
   4. question_type: string | null — the next question the assistant should ask. Valid values: "bedroom_size", "move_in_date", "over_20", "income_requirement", "eviction", "employment_age", "household_size", "full_name", "preferred_name", "next_steps"
Question_type should be selected from the above only if the question is explicitly asking these questions. The question type is only next_steps when no other valid values is mentioned. 
Otherwise, return null for question_type.
    For any field where information is not provided, use null.
    Provide JSON response only:
    IMPORTANT: Only return the raw JSON with no additional formatting, code blocks, or markup.
    `;

    const response = await evaluator.invoke(prompt);

    try {
      const result = JSON.parse(response.content.toString());
      return {
        basicInfo: {
          full_name: result.basicInfo?.full_name || '',
          preferred_name: result.basicInfo?.preferred_name || '',
          apt_size: result.basicInfo?.apt_size || '',
          move_in_date: result.basicInfo?.move_in_date || '',
        },
        qualificationInfo: {
          age: result.qualificationInfo?.age,
          income: result.qualificationInfo?.income,
          eviction: result.qualificationInfo?.eviction,
        },
        isQualified: result.isQualified || false,
        question_type: result.question_type || null,
      };
    } catch (parseError) {
      console.error('[ANALYZER] Failed to parse LLM response:', parseError);
      return {
        basicInfo: {
          full_name: '',
          preferred_name: '',
          apt_size: '',
          move_in_date: '',
        },
        qualificationInfo: { age: null, income: null, eviction: null },
        isQualified: false,
        question_type: null,
      };
    }
  } catch (error) {
    console.error('[ANALYZER] Error:', error);
    return {
      basicInfo: {
        full_name: '',
        preferred_name: '',
        apt_size: '',
        move_in_date: '',
      },
      qualificationInfo: { age: null, income: null, eviction: null },
      isQualified: false,
      question_type: null,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check Supabase configuration first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[API] Supabase configuration missing');
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    // Check Together API configuration
    const apiKey = process.env.TOGETHER_API_KEY;
    if (!apiKey) {
      console.error('[API] Together API key missing');
      return NextResponse.json({ error: 'Together API key not configured' }, { status: 500 });
    }

    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error('[API] Failed to parse request body:', error);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const returnIntermediateSteps = body.stateFetch;

    // Initialize agent tools with error handling
    let agentTools = [];
    try {
      agentTools = [showFAQTool, bookTourTool, new Calculator()];
    } catch (error) {
      console.error('[TOOLS] Error initializing tools:', error);
      return NextResponse.json({ error: 'Failed to initialize agent tools' }, { status: 500 });
    }

    // Get or create user in database
    let userData, userId, conversation;
    try {
      const result = await getOrCreateUser(body.userId);
      userData = result.userData;
      userId = userData.id;
      conversation = await getConversation(userId);
    } catch (error) {
      console.error('[API] Database operation failed:', error);
      return NextResponse.json({ error: 'Database operation failed' }, { status: 500 });
    }

    // Get messages for the agent
    if (!Array.isArray(body.messages)) {
      console.error('[API] Invalid messages format');
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 });
    }

    const messages = body.messages
      .filter(
        (message: { role: string }) => message.role === 'user' || message.role === 'assistant',
      )
      .map(convertVercelMessageToLangChainMessage);

    const messagesWithState = [...messages];

    // Setup agent and tools
    let chat, agent;
    try {
      chat = new ChatTogetherAI({
        model: Model_Name,
        temperature: 0,
        apiKey,
        verbose: true, // Enable verbose mode for debugging
      });

      agent = createReactAgent({
        llm: chat,
        tools: agentTools,
        messageModifier: new SystemMessage(getDefaultPromptAgent()),
      });
    } catch (error) {
      console.error('[API] Failed to initialize chat agent:', error);
      return NextResponse.json({ error: 'Failed to initialize chat agent' }, { status: 500 });
    }

    if (!returnIntermediateSteps) {
      // Streaming case
      try {
        const eventStream = agent.streamEvents({ messages: messagesWithState }, { version: 'v2' });

        const textEncoder = new TextEncoder();
        const transformStream = new ReadableStream({
          async start(controller) {
            try {
              for await (const { event, data } of eventStream) {
                if (event === 'on_chat_model_stream') {
                  if (!!data.chunk.content) {
                    controller.enqueue(textEncoder.encode(data.chunk.content));
                  }
                }
              }
            } catch (error) {
              console.error('[STREAM] Error in stream processing:', error);
              controller.error(error);
            } finally {
              controller.close();
            }
          },
        });

        return new Response(transformStream, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
          },
        });
      } catch (error) {
        console.error('[STREAM] Failed to create stream:', error);
        return NextResponse.json({ error: 'Failed to create response stream' }, { status: 500 });
      }
    } else {
      // Non-streaming case for state updates

      // Invoke the agent
      const result = await (agent as any).invoke(
        { messages: messagesWithState },
        { returnIntermediateSteps: true },
      );

      // Extract messages
      const outMessages = result.messages
        .filter((msg: any) => msg instanceof HumanMessage || msg instanceof AIMessage)
        .map(convertLangChainMessageToVercelMessage);

      // Check for question type markers in the most recent assistant message
      let currentQuestionFromMarker = null;
      if (outMessages.length > 0) {
        const lastAssistantMessage = outMessages[outMessages.length - 1];
        if (lastAssistantMessage.role === 'assistant') {
          const markerMatch = lastAssistantMessage.content.match(/<!--QUESTION_TYPE:([a-z_]+)-->/);
          if (markerMatch) {
            currentQuestionFromMarker = markerMatch[1];
          } else {
          }
        }
      }

      // Process user input and update database
      if (body.messages && body.messages.length > 0) {
        // Get latest user message
        const latestUserMessage = [...body.messages].reverse().find((m) => m.role === 'user');

        if (latestUserMessage && latestUserMessage.role === 'user') {
          // Save user message to history
          await saveMessage(userId, {
            role: latestUserMessage.role,
            content: latestUserMessage.content,
          });
        }
      }

      // Check for tool usage
      let faqShown = false;
      let bookingShown = false;

      if (result.intermediate_steps) {
        for (const step of result.intermediate_steps) {
          if (step.action && step.action.tool === 'showFAQ') {
            faqShown = true;
          }
          if (step.action && step.action.tool === 'bookTour') {
            bookingShown = true;
          }
        }
      }

      // Save assistant message if tools were used
      if (outMessages.length > 0) {
        const lastAssistantMessage = outMessages[outMessages.length - 1];
        if (lastAssistantMessage.role === 'assistant') {
          await saveMessage(
            userId,
            { role: 'assistant', content: lastAssistantMessage.content },
            faqShown || undefined,
            bookingShown || undefined,
          );
        }
      }

      // Update conversation flags in Supabase
      await supabase
        .from('conversations')
        .update({
          faq_shown: faqShown || conversation?.faq_shown,
          booking_shown: bookingShown || conversation?.booking_shown,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversation?.id);

      // Use the complete chat history from body.messages for analysis

      // Analyze conversation to extract information and qualification status
      const { basicInfo, qualificationInfo, isQualified, question_type } =
        await analyzeConversation(body.messages);

      // Update user information based on conversation analysis
      const updates: Partial<UserData> = {
        full_name: basicInfo.full_name || userData.full_name,
        preferred_name: basicInfo.preferred_name || userData.preferred_name,
        apartment_size: basicInfo.apt_size || userData.apartment_size,
        move_in_date: basicInfo.move_in_date || userData.move_in_date,
        over_20: qualificationInfo.age,
        income_requirement: qualificationInfo.income,
        eviction_history: qualificationInfo.eviction,
        is_qualified: isQualified,
      };

      // Save updated user info to DB
      await updateUser(userId, updates);

      // Get fresh user data after updates
      const { data: freshUserData } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Determine UI hint based on conversation state
      let uiHint = null;

      // Show FAQ panel if not already shown
      if (!conversation?.faq_shown && Object.values(basicInfo).some((val) => val && val !== '')) {
        uiHint = { type: 'show_checklist', autoOpen: true };
      }
      // Show booking link if qualified and not already shown
      else if (isQualified && !conversation?.booking_shown) {
        uiHint = {
          type: 'open_window',
          url: 'https://www.grandoaksburlington.com/amenities?show-appointment=true',
        };
      }
      // Calendar for move-in date
      else if (currentQuestionFromMarker === 'move_in_date') {
        uiHint = { type: 'calendar' };
      }

      // Filter out markers from displayed messages
      const filteredMessages = outMessages.map((message: { role: string; content: string }) => {
        if (message.role === 'assistant') {
          let content = message.content
            .replace(/<think>[\s\S]*?<\/think>/g, '')
            .replace(/<!--QUESTION_TYPE:[a-z_]+-->/g, '')
            .replace(/<!--OPEN_FAQ_PANEL-->/g, '')
            .trim();
          return { ...message, content };
        }
        return message;
      });
      return NextResponse.json({
        messages: filteredMessages,
        userId: userId,
        qualified: freshUserData.is_qualified,
        ui_hint: uiHint,
        current_question: question_type,
      });
    }
  } catch (error: any) {
    console.error('[API] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
