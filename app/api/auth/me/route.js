import pool from '@/src/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { id } = await request.json();
    
    // Find User
    const [users] = await pool.query('SELECT * FROM users WHERE id = ? AND isActive = TRUE', [id]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'Session invalid' }, { status: 401 });
    }
    
    const { password: _, ...safeUser } = users[0];
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Session check failed:', error);
    return NextResponse.json({ error: 'Auth check failed' }, { status: 500 });
  }
}
