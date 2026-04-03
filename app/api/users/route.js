import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';

// GET all active users
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, isActive, created_at FROM users ORDER BY created_at ASC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Add new user (admin only)
export async function POST(request) {
  try {
    const { name, email, password, role } = await request.json();
    const id = Date.now().toString();
    await pool.query(
      'INSERT INTO users (id, name, email, password, role, isActive) VALUES (?, ?, ?, ?, ?, TRUE)',
      [id, name, email, password, role || 'staff']
    );
    return NextResponse.json({ id, name, email, role: role || 'staff' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// PUT - Update user
export async function PUT(request) {
  try {
    const { id, name, email, role, isActive } = await request.json();
    await pool.query(
      'UPDATE users SET name=?, email=?, role=?, isActive=? WHERE id=?',
      [name, email, role, isActive !== false, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
