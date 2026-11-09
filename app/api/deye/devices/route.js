import { NextResponse } from 'next/server';
import { getAccessToken, getStationDevices } from '../../../../lib/deye';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const stationId = searchParams.get('stationId');

    if (!stationId) {
      return NextResponse.json(
        { success: false, error: 'stationId parameter is required' },
        { status: 400 }
      );
    }

    await getAccessToken();
    const result = await getStationDevices(stationId, 1, 50);
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Devices route error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
