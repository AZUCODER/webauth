import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session/manager';

export async function GET() {
  try {
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    // Return a safe subset of session data (don't expose sensitive information)
    return NextResponse.json({
      userId: session.userId,
      role: session.role,
      isAuthenticated: true
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 