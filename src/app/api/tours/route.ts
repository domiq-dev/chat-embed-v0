import { NextResponse } from 'next/server';
import axios from 'axios';
import { mapConversationToTour } from '@/lib/data-mappers';

// Get the database API URL from environment variables
const DATABASE_API_URL = process.env.DATABASE_API_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    // Fetch conversations with tour data
    const response = await axios.get(
      `${DATABASE_API_URL}/api/v1/conversations?is_book_tour=true&expand=user,property_manager`,
    );

    // Transform the data to match our frontend model
    const tours = response.data.items
      .map((conversation: any) =>
        mapConversationToTour(conversation, conversation.user, conversation.property_manager),
      )
      .filter(Boolean); // Remove nulls

    return NextResponse.json(tours);
  } catch (error) {
    console.error('Error fetching tours:', error);
    return NextResponse.json({ error: 'Failed to fetch tours from database' }, { status: 500 });
  }
}
