import { NextResponse } from 'next/server';
import axios from 'axios';
import { mapPropertyManagerToAgent } from '@/lib/data-mappers';

// Get the database API URL from environment variables
const DATABASE_API_URL = process.env.DATABASE_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    // Fetch property managers
    const response = await axios.get(`${DATABASE_API_URL}/api/v1/property-managers`);
    
    // Transform the data to match our frontend model
    const agents = response.data.items.map((manager: any) => 
      mapPropertyManagerToAgent(manager)
    );
    
    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching property managers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property managers from database' },
      { status: 500 }
    );
  }
} 