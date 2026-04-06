import pool from '@/src/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signJwt } from '@/src/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM users WHERE isActive = TRUE');
    const needsSetup = rows[0].count === 0;
    return NextResponse.json({ needsSetup });
  } catch (error) {
    // Table doesn't exist yet — needs setup
    return NextResponse.json({ needsSetup: true });
  }
}

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please fill all required fields.' }, { status: 400 });
    }

    const id = Date.now().toString();

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Try to create users table if it doesn't exist before inserting
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'staff',
        isActive BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(
      'INSERT INTO users (id, name, email, password, role, isActive) VALUES (?, ?, ?, ?, ?, TRUE)',
      [id, name, email, hashedPassword, 'admin']
    );

    // Create session cookie
    const token = await signJwt({ id, role: 'admin' });
    (await cookies()).set({
      name: 'webzio_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ success: true, user: { id, name, email, role: 'admin' } });
  } catch (error) {
    console.error('Setup failed:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email already exists.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create admin user.' }, { status: 500 });
  }
}
