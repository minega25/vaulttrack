import { NextResponse } from 'next/server';
import { createCategory, listCategories } from '@/db';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    return NextResponse.json(await listCategories());
  } catch (err) {
    return apiError(err, 'Failed to load categories');
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(await createCategory(body));
  } catch (err) {
    return apiError(err, 'Failed to create category');
  }
}
