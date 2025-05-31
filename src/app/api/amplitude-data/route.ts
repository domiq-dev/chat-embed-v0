import { NextRequest, NextResponse } from 'next/server';
import { amplitudeDataService } from '@/lib/amplitude-data-service';

const REQUEST_TIMEOUT = 15000; // 15 seconds for API routes

export async function GET(request: NextRequest) {
  // Set up timeout for the entire request
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, REQUEST_TIMEOUT);

  try {
    const { searchParams } = new URL(request.url);
    const leadId = searchParams.get('leadId');
    const userId = searchParams.get('userId');
    const deviceId = searchParams.get('deviceId');
    const days = parseInt(searchParams.get('days') || '30');

    if (!leadId && !userId && !deviceId) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'Must provide leadId, userId, or deviceId' },
        { status: 400 }
      );
    }

    let amplitudeData;
    
    if (leadId) {
      amplitudeData = await amplitudeDataService.getLeadAmplitudeData(leadId);
    } else {
      amplitudeData = await amplitudeDataService.getUserData(
        userId || undefined, 
        deviceId || undefined, 
        days
      );
    }

    clearTimeout(timeoutId);
    return NextResponse.json({ 
      success: true, 
      data: amplitudeData 
    });

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Amplitude API request timed out');
      return NextResponse.json(
        { error: 'Request timed out' },
        { status: 408 }
      );
    }
    
    console.error('Amplitude API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Amplitude data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Set up timeout for the entire request
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => {
    timeoutController.abort();
  }, REQUEST_TIMEOUT);

  try {
    const body = await request.json();
    const { leadIds } = body;

    if (!Array.isArray(leadIds)) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { error: 'leadIds must be an array' },
        { status: 400 }
      );
    }

    // Limit concurrent requests to prevent overwhelming the API
    const MAX_CONCURRENT = 5;
    const chunks = [];
    for (let i = 0; i < leadIds.length; i += MAX_CONCURRENT) {
      chunks.push(leadIds.slice(i, i + MAX_CONCURRENT));
    }

    const aggregatedData: Record<string, any> = {};

    // Process chunks sequentially to avoid rate limiting
    for (const chunk of chunks) {
      const promises = chunk.map((leadId: string) => 
        amplitudeDataService.getLeadAmplitudeData(leadId)
          .catch(error => {
            console.warn(`Failed to fetch data for lead ${leadId}:`, error);
            return {}; // Return empty object for failed leads
          })
      );

      const results = await Promise.allSettled(promises);
      
      chunk.forEach((leadId: string, index: number) => {
        const result = results[index];
        if (result.status === 'fulfilled') {
          aggregatedData[leadId] = result.value;
        } else {
          console.warn(`Lead ${leadId} data fetch rejected:`, result.reason);
          aggregatedData[leadId] = {}; // Empty fallback
        }
      });
    }

    clearTimeout(timeoutId);
    return NextResponse.json({ 
      success: true, 
      data: aggregatedData,
      processed: leadIds.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Bulk Amplitude API request timed out');
      return NextResponse.json(
        { error: 'Bulk request timed out' },
        { status: 408 }
      );
    }
    
    console.error('Bulk Amplitude API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bulk Amplitude data' },
      { status: 500 }
    );
  }
} 