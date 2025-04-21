import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session/manager';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      );
    }
    
    // Return only the necessary session information
    return NextResponse.json({
      userId: session.userId,
      username: session.username,
      email: session.email,
      role: session.role,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 