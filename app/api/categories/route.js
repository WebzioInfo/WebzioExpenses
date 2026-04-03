import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM categories WHERE isActive = TRUE ORDER BY type ASC, name ASC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, type } = await request.json();
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    await pool.query(
      'INSERT INTO categories (id, name, type, isActive) VALUES (?, ?, ?, TRUE)',
      [id, name, type]
    );
    return NextResponse.json({ id, name, type });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, type } = await request.json();
    await pool.query(
      'UPDATE categories SET name=?, type=? WHERE id=?',
      [name, type, id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    // Soft delete
    await pool.query('UPDATE categories SET isActive = FALSE WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to remove category' }, { status: 500 });
  }
}
