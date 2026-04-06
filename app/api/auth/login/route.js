import pool from '@/src/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/src/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    // Find User
    const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND isActive = TRUE', [email]);
    
    if (users.length === 0) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }
    
    const user = users[0];
    
    // Check Password using bcrypt
    let isMatch = await bcrypt.compare(password, user.password);
    
    // If no match, check if it's a legacy plain-text password
    if (!isMatch && password === user.password) {
      console.log('🔄 Migrating plain-text password to hash for user:', email);
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, user.id]);
      isMatch = true;
    }

    if (!isMatch) {
       return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }
    
    // Return User (excluding password)
    const { password: _, ...safeUser } = user;
    
    // Parse permissions if they exist
    if (safeUser.permissions) {
      try {
        safeUser.permissions = JSON.parse(safeUser.permissions);
      } catch (e) {
        safeUser.permissions = ["Tasks"];
      }
    }

    // Create session cookie
    const token = await signJwt({ id: safeUser.id, role: safeUser.role, permissions: safeUser.permissions });
    (await cookies()).set({
      name: 'webzio_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json({ error: 'Login system error' }, { status: 500 });
  }
}
