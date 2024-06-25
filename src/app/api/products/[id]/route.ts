import db from '@/db';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await db.getProduct(params.id);

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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const {
      name,
      description,
      unit_price,
      reorder_level,
      lead_time,
      category_id,
    } = await request.json();
    const result = await db.updateProduct(
      params.id,
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
