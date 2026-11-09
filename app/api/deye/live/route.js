import { NextResponse } from 'next/server';
import { getAccessToken, getDeviceLatest } from '../../../../lib/deye';

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

    const deviceSnArray = deviceSn.split(',');

    await getAccessToken();
    const result = await getDeviceLatest(deviceSnArray);
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Live route error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
