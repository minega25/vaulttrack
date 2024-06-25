import db from '@/db';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      name,
      description,
      unit_price,
      reorder_level,
      lead_time,
      category_id,
    } = await request.json();
    const result = await db.createProduct(
      name,
      description,
      unit_price,
      reorder_level,
      lead_time,
      category_id
    );

    return NextResponse.json(result);
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || err.toString() }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
