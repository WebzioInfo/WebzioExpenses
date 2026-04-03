import pool from '@/src/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Find User
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND isActive = TRUE', [email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }
    
    const user = users[0];
    
    // Check Password (simple for now)
    if (user.password !== password) {
       return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Return User (excluding password)
    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login system error' }, { status: 500 });
  }
}
