import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { mapToLead } from '@/lib/data-mappers';

// Get the FastAPI URL from environment variables
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

// Get the database API URL from environment variables
const DATABASE_API_URL = process.env.DATABASE_API_URL || 'http://127.0.0.1:8000';

// Lead submission interface matching your FastAPI backend
interface LeadSubmission {
  user: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    lead_source: string;
  };
  conversation: {
    chatbot_id: string;
    start_time: Date;
    end_time?: Date;
    is_book_tour: boolean;
    apartment_size_preference?: string;
    price_range_min?: number;
    price_range_max?: number;
    tour_type?: string;
    tour_datetime?: Date;
    move_in_date?: Date;
    is_qualified?: boolean;
    kb_pending?: any;
  };
  messages: Array<{
    sender_type: 'user' | 'bot';
    message_text: string;
    timestamp: Date;
  }>;
}

// Helper function to serialize dates for JSON
function serializeDates(obj: any): any {
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(serializeDates);
  }
  if (obj && typeof obj === 'object') {
    const serialized: any = {};
    for (const [key, value] of Object.entries(obj)) {
      serialized[key] = serializeDates(value);
    }
    return serialized;
  }
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    const leadData: LeadSubmission = await request.json();
    
    // Ensure dates are properly serialized for JSON
    const serializedData = serializeDates(leadData);
    
    console.log('📤 Forwarding lead to FastAPI...');
    
    // Forward to Python API
    const response = await fetch(`${PYTHON_API_URL}/api/leads/`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(serializedData),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastAPI error:', errorText);
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log('✅ Lead created successfully:', result.lead_id);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error creating lead:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('🔍 Fetching leads from database API...');
    console.log(`📡 Request URL: ${DATABASE_API_URL}/api/v1/conversations?expand=user,property_manager`);
    
    // Fetch conversations with expanded user data
    const response = await axios.get(`${DATABASE_API_URL}/api/v1/conversations?expand=user,property_manager`, {
      timeout: 10000, // 10 second timeout
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      }
    });
    
    console.log(`✅ Got ${response.data.items?.length || 0} conversations from database`);
    
    if (!response.data.items || response.data.items.length === 0) {
      console.warn('⚠️ No conversations found in the database API response');
      return NextResponse.json([]);
    }
    
    console.log('📦 First conversation sample:', JSON.stringify(response.data.items[0]).substring(0, 150) + '...');
    
    // Transform the data to match our frontend model
    const leads = await Promise.all(
      (response.data.items || []).map(async (conversation: any) => {
        try {
          // Fetch activities for this conversation
          console.log(`🔍 Fetching activities for conversation ${conversation.id}...`);
          const activitiesResponse = await axios.get(
            `${DATABASE_API_URL}/api/v1/conversations/${conversation.id}/activities`
          );
          
          console.log(`✅ Got ${activitiesResponse.data.items?.length || 0} activities for conversation ${conversation.id}`);
          
          return mapToLead(
            conversation,
            conversation.user,
            activitiesResponse.data.items || []
          );
        } catch (activityError) {
          console.error(`❌ Error fetching activities for conversation ${conversation.id}:`, activityError);
          // Still return the lead even if activities failed
          return mapToLead(conversation, conversation.user, []);
        }
      })
    );
    
    console.log(`🎉 Transformed ${leads.length} leads for frontend`);
    return NextResponse.json(leads);
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    
    // Provide more specific error information
    if (axios.isAxiosError(error)) {
      console.error('Network Error Details:', {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        data: error.response?.data,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL,
        }
      });
    }
    
    // Return empty array instead of error to prevent UI from breaking
    return NextResponse.json([]);
  }
}