import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM people WHERE isActive = TRUE ORDER BY name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, role, note } = await request.json();
    const id = Date.now().toString();
    await pool.query(
      'INSERT INTO people (id, name, role, note, isActive) VALUES (?, ?, ?, ?, TRUE)',
      [id, name, role || 'Staff', note || '']
    );
    return NextResponse.json({ id, name, role, note });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, role, note } = await request.json();
    await pool.query(
      'UPDATE people SET name=?, role=?, note=? WHERE id=?',
      [name, role, note || '', id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    // Soft delete — reassign their transactions to null (orphan protection)
    await pool.query('UPDATE transactions SET personId = NULL WHERE personId = ?', [id]);
    await pool.query('UPDATE people SET isActive = FALSE WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to remove staff' }, { status: 500 });
  }
}
