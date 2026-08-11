import { NextResponse } from 'next/server';
import { recordMovement } from '@/db';
import { apiError } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await recordMovement(body));
  } catch (err) {
    return apiError(err, 'Failed to record movement');
  }
}
