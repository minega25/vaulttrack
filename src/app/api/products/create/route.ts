import { NextResponse } from 'next/server';
import { createProduct } from '@/db';
import { apiError } from '@/lib/api';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await createProduct(body);
    return NextResponse.json(result);
  } catch (err) {
    return apiError(err, 'Failed to create product');
  }
}
