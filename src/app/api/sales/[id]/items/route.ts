import { NextResponse } from 'next/server';
import { addSalesItem } from '@/db';
import { apiError } from '@/lib/api';

type Params = { params: { id: string } };

export async function POST(request: Request, { params }: Params) {
  try {
    return NextResponse.json(
      await addSalesItem(params.id, await request.json())
    );
  } catch (err) {
    return apiError(err, 'Failed to add line item');
  }
}
