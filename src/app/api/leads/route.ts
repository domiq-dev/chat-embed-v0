import { NextRequest, NextResponse } from 'next/server';

// Get the FastAPI URL from environment variables
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:8000';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build query string for FastAPI
    const queryString = searchParams.toString();
    const url = queryString 
      ? `${PYTHON_API_URL}/api/leads/?${queryString}`
      : `${PYTHON_API_URL}/api/leads/`;
    
    console.log('📤 Fetching leads from FastAPI...');
    
    // Forward to FastAPI
    const response = await fetch(url, {
      method: 'GET',
      headers: { 
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ FastAPI error:', errorText);
      throw new Error(`FastAPI error: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    console.log(`✅ Fetched ${result.leads?.length || 0} leads successfully`);
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('❌ Error fetching leads:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch leads',
        leads: [],
        total: 0,
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}