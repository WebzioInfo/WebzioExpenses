import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM accounts WHERE isActive = TRUE ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch accounts. Please check database connectivity.' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, type } = await request.json();
    const id = Date.now().toString();
    await pool.query(
      'INSERT INTO accounts (id, name, type, balance, isActive) VALUES (?, ?, ?, 0, TRUE)',
      [id, name, type || 'other']
    );
    return NextResponse.json({ id, name, type, balance: 0 });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await pool.query('UPDATE accounts SET isActive = FALSE WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to disable account' }, { status: 500 });
  }
}
