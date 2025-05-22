import { NextResponse } from 'next/server';
import { processMessage } from '@/lib/actions/chat-actions';

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json();
    
    if (!sessionId || !message) {
      return NextResponse.json(
        { error: 'Session ID and message are required' },
        { status: 400 }
      );
    }

    const result = await processMessage(sessionId, message);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
} 