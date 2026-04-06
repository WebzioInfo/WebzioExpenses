import { NextResponse } from 'next/server';
import pool from '@/src/lib/db';
import { getServerSession } from '@/src/lib/auth-server';

export async function GET(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let sql = 'SELECT * FROM staff WHERE isActive = TRUE';
    const params = [];

    // RBAC: Staff only see themselves
    if (!session.isAdmin) {
      if (!session.staffId) return NextResponse.json([]);
      sql += ' AND id = ?';
      params.push(session.staffId);
    } else {
      sql += ' ORDER BY name ASC';
    }

    const [rows] = await pool.query(sql, params);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to fetch staff' }, { status: 500 });
  }
}

import { logActivity } from '@/src/lib/activity';

export async function POST(request) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, role, note } = await request.json();
    const id = Date.now().toString();
    
    // Auto-generate professional email if not provided
    const professionalEmail = email || `${name.toLowerCase().replace(/\s+/g, '')}@webziointernational.in`;

    await pool.query(
      'INSERT INTO staff (id, name, email, role, note, isActive) VALUES (?, ?, ?, ?, ?, TRUE)',
      [id, name, professionalEmail, role || 'Staff', note || '']
    );

    await logActivity(session.user.id, 'Added Staff', 'Staff', { staffId: id, name });

    return NextResponse.json({ id, name, email: professionalEmail, role, note });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to add staff' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, name, email, role, note } = await request.json();

    // RBAC: Staff can only edit their own note? 
    // Usually Admin manages roles/emails.
    if (!session.isAdmin && id !== session.staffId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const query = session.isAdmin 
      ? 'UPDATE staff SET name=?, email=?, role=?, note=? WHERE id=?'
      : 'UPDATE staff SET note=? WHERE id=?';
    
    const params = session.isAdmin 
      ? [name, email, role, note || '', id]
      : [note || '', id];

    await pool.query(query, params);

    await logActivity(session.user.id, 'Updated Staff', 'Staff', { staffId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to update staff' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams = new URL(request.url).searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    // Soft delete
    await pool.query('UPDATE transactions SET personId = NULL WHERE personId = ?', [id]);
    await pool.query('UPDATE staff SET isActive = FALSE WHERE id = ?', [id]);
    
    await logActivity(session.user.id, 'Deleted Staff', 'Staff', { staffId: id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DB Error:', error);
    return NextResponse.json({ error: 'Failed to remove staff' }, { status: 500 });
  }
}
