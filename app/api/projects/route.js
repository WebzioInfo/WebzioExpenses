import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM projects WHERE isActive = TRUE ORDER BY created_at DESC');
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { name, clientName, description, status } = await request.json();
    const id = Date.now().toString();
    await pool.query(
      'INSERT INTO projects (id, name, clientName, description, status, isActive) VALUES (?, ?, ?, ?, ?, TRUE)',
      [id, name, clientName || '', description || '', status || 'Active']
    );
    return NextResponse.json({ id, name, clientName, description, status: status || 'Active' });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const { id, name, clientName, description, status } = await request.json();
    await pool.query(
      'UPDATE projects SET name=?, clientName=?, description=?, status=? WHERE id=?',
      [name, clientName || '', description || '', status || 'Active', id]
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    // Soft delete — keep transaction history intact
    await pool.query('UPDATE projects SET isActive = FALSE WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to remove project' }, { status: 500 });
  }
}
