import { NextResponse } from 'next/server';
import { getAccessToken, getDeviceHistory } from '../../../../lib/deye';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceSn = searchParams.get('deviceSn');
    const startAt = searchParams.get('startAt');
    const endAt = searchParams.get('endAt') || startAt;
    const granularity = parseInt(searchParams.get('granularity') || '1', 10);
    const measurePointsParam = searchParams.get('measurePoints');
    const measurePoints = measurePointsParam
      ? measurePointsParam.split(',')
      : [];

    if (!deviceSn) {
      return NextResponse.json(
        { success: false, error: 'deviceSn parameter is required' },
        { status: 400 }
      );
    }

    if (!startAt) {
      return NextResponse.json(
        { success: false, error: 'startAt parameter is required' },
        { status: 400 }
      );
    }

    await getAccessToken();
    const result = await getDeviceHistory(
      deviceSn,
      startAt,
      endAt,
      granularity,
      measurePoints
    );
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('History route error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
