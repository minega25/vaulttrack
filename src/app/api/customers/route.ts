import { NextResponse } from 'next/server';
import { createCustomer, listCustomers } from '@/db';
import { apiError } from '@/lib/api';

export async function GET() {
  try {
    return NextResponse.json(await listCustomers());
  } catch (err) {
    return apiError(err, 'Failed to load customers');
  }
}

export async function POST(request: Request) {
  try {
    return NextResponse.json(await createCustomer(await request.json()));
  } catch (err) {
    return apiError(err, 'Failed to create customer');
  }
}
