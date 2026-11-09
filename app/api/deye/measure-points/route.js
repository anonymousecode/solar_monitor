import { NextResponse } from 'next/server';
import { getAccessToken, getDeviceMeasurePoints } from '../../../../lib/deye';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceSn = searchParams.get('deviceSn');

    if (!deviceSn) {
      return NextResponse.json(
        { success: false, error: 'deviceSn parameter is required' },
        { status: 400 }
      );
    }

    await getAccessToken();
    const result = await getDeviceMeasurePoints(deviceSn);
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Measure points route error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
