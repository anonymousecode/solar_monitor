import { NextResponse } from 'next/server';
import { getAccessToken, getStations } from '../../../../lib/deye';

export async function GET() {
  try {
    await getAccessToken();
    const result = await getStations(1, 50);
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stations route error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
