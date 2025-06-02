import { NextResponse } from 'next/server';
import axios from 'axios';

export async function GET() {
  try {
    // Get environment variables
    const databaseApiUrl = process.env.DATABASE_API_URL || 'http://127.0.0.1:8000';
    
    console.log('DEBUG: Testing API connections');
    console.log(`DEBUG: DATABASE_API_URL = ${databaseApiUrl}`);
    
    // Test health endpoint
    const healthResponse = await axios.get(`${databaseApiUrl}/health`);
    console.log('DEBUG: Health response:', healthResponse.data);
    
    // Test conversations endpoint
    const conversationsResponse = await axios.get(`${databaseApiUrl}/api/v1/conversations?expand=user`);
    console.log(`DEBUG: Got ${conversationsResponse.data.items?.length || 0} conversations`);
    
    return NextResponse.json({
      success: true,
      env: {
        databaseApiUrl,
      },
      health: healthResponse.data,
      conversationsCount: conversationsResponse.data.items?.length || 0
    });
  } catch (error) {
    console.error('DEBUG ERROR:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : null
    }, { status: 500 });
  }
} 