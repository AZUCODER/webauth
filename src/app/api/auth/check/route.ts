import { NextResponse } from 'next/server';
import { getSession, checkSessionStatus } from '@/lib/session/manager';

/**
 * API Route for checking authentication status
 * This allows client components to check if the user is authenticated
 */
export async function GET() {
  try {
    // Get the current session
    const session = await getSession();

    // Check session status
    const status = await checkSessionStatus();

    return NextResponse.json({
      authenticated: !!session && status.isValid,
      user: session ? {
        userId: session.userId,
        username: session.username,
        email: session.email,
        role: session.role
      } : null,
      expires: session?.exp ? new Date(session.exp * 1000).toISOString() : null
    });
  } catch (error) {
    console.error('Authentication check error:', error);

    return NextResponse.json(
      {
        authenticated: false,
        error: 'Failed to verify authentication status'
      },
      { status: 500 }
    );
  }
} 