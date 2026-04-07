import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import bcrypt from 'bcryptjs';

// GET all active users
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, isActive, permissions, created_at FROM users ORDER BY created_at ASC'
    );
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Add new user (admin only)
export async function POST(request) {
  try {
    const { name, email, password, role, permissions } = await request.json();
    const id = Date.now().toString();
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await pool.query(
      'INSERT INTO users (id, name, email, password, role, isActive, permissions) VALUES (?, ?, ?, ?, ?, TRUE, ?)',
      [id, name, email, hashedPassword, role || 'Staff', JSON.stringify(permissions || ["Tasks"])]
    );
    return NextResponse.json({ id, name, email, role: role || 'Staff', permissions });
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
    const { id, name, email, role, isActive, permissions, password } = await request.json();
    
    if (password && password.trim().length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET name=?, email=?, role=?, isActive=?, permissions=?, password=? WHERE id=?',
        [name, email, role, isActive !== false, JSON.stringify(permissions), hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET name=?, email=?, role=?, isActive=?, permissions=? WHERE id=?',
        [name, email, role, isActive !== false, JSON.stringify(permissions), id]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
