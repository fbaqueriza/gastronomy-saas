import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    supabase: {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  });
}
