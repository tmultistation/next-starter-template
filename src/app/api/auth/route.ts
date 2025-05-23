import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PIN = '611611';

interface AuthRequest {
  pin: string;
}

export async function POST(request: NextRequest) {
  try {
    const { pin }: AuthRequest = await request.json();
    
    if (pin === ADMIN_PIN) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
} 