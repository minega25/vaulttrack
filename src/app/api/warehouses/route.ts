import { NextResponse } from 'next/server';
import { createWarehouse, listWarehouses } from '@/db';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    return NextResponse.json(await listWarehouses());
  } catch (err) {
    return apiError(err, 'Failed to load warehouses');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await createWarehouse(body));
  } catch (err) {
    return apiError(err, 'Failed to create warehouse');
  }
}
