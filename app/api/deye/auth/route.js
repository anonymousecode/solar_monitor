import { NextResponse } from 'next/server';
import { getAuthInfo } from '../../../../lib/deye';

export async function GET() {
  try {
    const auth = await getAuthInfo();
    return NextResponse.json({
      success: true,
      authenticated: true,
      uid: auth.uid,
    });
  } catch (error) {
    console.error('Auth route error:', error.message);
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
