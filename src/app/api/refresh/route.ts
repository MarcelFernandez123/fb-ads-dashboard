import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Clear any caches and trigger refresh
    // In production, this would invalidate the MCP cache

    return NextResponse.json({
      success: true,
      message: 'Data refresh triggered',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error triggering refresh:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
