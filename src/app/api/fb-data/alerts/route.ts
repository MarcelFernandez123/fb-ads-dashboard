import { NextResponse } from 'next/server';

// Demo alerts for development
function generateDemoAlerts() {
  return [
    {
      id: 'alert-1',
      accountId: 'charlie-ralph-gc',
      accountName: 'Charlie Ralph Gold Coast',
      type: 'declining_roas',
      severity: 'warning',
      message: 'ROAS is 4.21x (below 5x target)',
      value: 4.21,
      threshold: 5,
      timestamp: new Date().toISOString(),
    },
    {
      id: 'alert-2',
      accountId: 'roar-mma-rockingham',
      accountName: 'ROAR MMA Rockingham',
      type: 'high_cost_per_sub',
      severity: 'warning',
      message: 'Cost per subscription is $85.24 (above $80 threshold)',
      value: 85.24,
      threshold: 80,
      timestamp: new Date().toISOString(),
    },
  ];
}

export async function GET() {
  try {
    const alerts = generateDemoAlerts();

    return NextResponse.json({
      success: true,
      data: alerts,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      },
      { status: 500 }
    );
  }
}
