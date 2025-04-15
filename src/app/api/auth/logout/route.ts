import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/session/actions';

/**
 * API Route for logging out
 * This allows client components to trigger logout
 */
export async function POST() {
  try {
    // Destroy the current session
    await destroySession();

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to logout'
      },
      { status: 500 }
    );
  }
} 