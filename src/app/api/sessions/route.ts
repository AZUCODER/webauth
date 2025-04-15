import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/session/actions';
import { Prisma } from '@prisma/client';

/**
 * API Route for retrieving session data
 * Used for displaying login history on the dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Get the current user session to authorize the request
    const session = await getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '100', 10), 500);

    // Calculate date for filtering
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get sessions for the current user
    const sessions = await prisma.session.findMany({
      where: {
        userId: session.userId,
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true
      }
    });

    // Calculate sessions by day without raw SQL query
    const sessionsByDay = [];
    const daysMap = new Map();
    
    // Fill in all dates in the range with zero counts
    for (let i = 0; i <= days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
      daysMap.set(dateStr, 0);
    }
    
    // Count sessions by day
    for (const session of sessions) {
      const dateStr = new Date(session.createdAt).toISOString().split('T')[0];
      if (daysMap.has(dateStr)) {
        daysMap.set(dateStr, daysMap.get(dateStr) + 1);
      }
    }
    
    // Convert the map to the expected format
    for (const [date, count] of daysMap.entries()) {
      sessionsByDay.push({ date, count });
    }
    
    // Sort by date
    sessionsByDay.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      sessions,
      sessionsByDay
    });
  } catch (error) {
    console.error('Session data fetch error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch session data'
      },
      { status: 500 }
    );
  }
} 