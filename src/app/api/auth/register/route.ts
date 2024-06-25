// src/app/api/auth/signup/route.ts
import db from '@/db';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const {
      email,
      password,
      name,
      phone,
      confirmPassword,
      firstName,
      lastName,
    } = await request.json();
    const companyId = await db.createCompany(name, phone);
    const result = await db.register(
      email,
      password,
      confirmPassword,
      companyId,
      firstName,
      lastName
    );
    console.log('result', result);

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
