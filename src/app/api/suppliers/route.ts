import { NextResponse } from 'next/server';
import { createSupplier, listSuppliers } from '@/db';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    return NextResponse.json(await listSuppliers());
  } catch (err) {
    return apiError(err, 'Failed to load suppliers');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await createSupplier(body));
  } catch (err) {
    return apiError(err, 'Failed to create supplier');
  }
}
